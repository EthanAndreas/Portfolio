---
theme: page
---

# SDN project with P4 and Python

## Introduction

This project aims to design a **fully adaptable and programmable network**, independent of hardware, where functionalities can be dynamically modified based on user requests through a **Command Line Interface (CLI)**. The physical network topology is represented as a clique, used by **Mininet**, while the logical topology is depicted as a **NetworkX graph**, enabling the implementation of various devices such as *routers*, *load balancers*, and *firewalls* using P4 switches.
The project includes a *meta-controller* with full knowledge of the network state of the state of the network, which launches specific controllers for each switch depending on the equipment deployed. These controllers implement the logic specific to each piece of equipment, including the calculation and installation of the shortest paths for routers. Finally, a interface is available to the user, offering the option of displaying information on the network topology and modify it as required.

To launch the project, start by running the script that launches the physical topology in Mininet:

```bash
sudo python phyNet.py --<light|medium|complex> --layer <2|3>
```

The --layer option lets you choose the network layer (layer 2 or 3). The --<light|medium|complex> option lets you select the network topology from the predefined topologies in the topology folder. The physical topology is then created in the topology.json file.

Next, run the script to set up the logical topology by flashing the various routers with the
different routers with the P4 program associated with them, depending on the topology chosen:

```bash
sudo python logiNet.py -input <topologie_yaml>
```

The --input option lets you choose the logical network input file from the predefined files
in the [topology](https://github.com/EthanAndreas/Rapace/tree/main/topology) folder. Thus the new logical topology used by the switches is created in
the *topology_2.json* file, the network is then in place and the API is launched on which you can interact the network using various commands.

It is also possible to define the logical topology yourself. The format of the yaml file is as follows:

```yaml
nodes:
  - name: s1
    type: load-balancer
    neighbors: s2 s3
    inflow: s2
```

- *nodes*: provides the list of nodes.
- *name*: is the name of the controller and must be the same name as one of the nodes in the network.
- *type*: is the type of controller (firewall, load-balancer, router, router-lw).
- *neighbors*: is the list of neighbours of the node.
- *inflow*: is the incoming flow node for the load-balancer (leave blank if it's another type of controller).

Be careful to modify the phyNet.py script if the yaml file is modified. For example, you need to
increase the number of P4 switches, add hosts, and match the links between host and
switch P4 because, unlike the links between switches, hosts are only connected to a single switch (the switches are all connected to each other).

## Control-plane (python)

The control plane is responsible for managing the network topology and creating and maintaining routing tables. This part is coded in Python and is organised into different classes.

### Meta-controller class

The **MetaController** class is responsible for importing the logical topology into the physical topology. To this, this class has several methods:

- ***init_import_logi_topology***: is responsible for creating a copy of the *topology.json* file in order to keep a backup of the original file delivered by *phyNet.py*, and deleting links and nodes not entered by the user in the yaml file in the logical topology (*topology_2.json*).
- ***import_logi_topology***: is responsible for creating the controllers specified by the user in the yaml file (this takes into account the type of controller, and uses the class corresponding to the type), compiling the associated or unrelated P4 files according to the arguments entered for logiNet.py, flashing the P4 file on the corresponding node in the physical topology, and store the list of controllers in memory.
- ***add_loopback***: adds a loopback IP address for router-type controllers.
- ***add_node***: adds a node to the logical topology only if it exists in the physical topology
based on the node ID.
- ***remove_node***: removes a node from the logical topology.
- ***add_link***: adds a link between two nodes on the logical topology only if it exists on the physical topology.
- ***remove_link***: removes a link between two nodes in the logical topology.
- ***swap_node***: changes the controller of a node to another type by deleting the old one and creating the new one, then reflashing it.
- ***change_weight***: changes the weight of a link in the logical topology.
- ***set_rate_limit***: changes the rate limit for all load balancers.
- ***reset_all_tables***: resets all tables for all controllers.

Note that methods which make changes to the logical topology call an update_topologies method to reload the logical topology on each controller. There are other methods in addition to those shown above, some to make programming easier and others to display information about the controllers stored in memory (the list of controllers' neighbours, the number of controllers in memory, etc.).

### Controller class

The **Controller** class is the parent class of each type class (Firewall, Load-balancer, Router,
RouterLw). It implements the methods common to all these classes:

- ***compile***: compiles the P4 file.
- ***flash***: flashes the compiled P4 file on the device.
- ***update_topology***: updates the logical topology with the one given as an argument.

Each controller has an ***init_table*** method adapted to its type.

### Firewall class

The purpose of the **Firewall** class is to initialise the tables of the node in question by adding a match on the ingress port. This match is used to take account only of logical topology links, discarding all packets arriving on physical and non-logical links. This class has a final ***add_rule*** method for adding filtering rules directly to one of the tables.

### Load-balancer class

The **LoadBalancer** class mainly initializes the tables of the associated node. To do this, the
class has the list of neighbours as well as the neighbour which provides the incoming flow. The ***init_table*** method initializes the tables by adding a match on the ingress port and associates an action depending on whether the port is a port of the outgoing flow or the port of the incoming flow. It also initializes another table by adding a match on a number between 0 and the number of ports in the outgoing flow, and assigns as an argument the port of each neighbour of the outgoing flow.

### Router and Router-Lw class

The **Router** and **RouterLw** classes are the same classes. The purpose of these classes is to initialise the associated node by adding for each possible destination a match on the destination IP address and adding as an argument the MAC address of the next hop interface (calculated according to the shortest path from the node in question to the destination on the logical topology) on the link with the node. Table initialisation also includes adding a match on the ingress port to add the source IP address of packets arriving at the node in the ICMP header (the aim being to provide the information necessary for the ICMP protocol to fill in the IP of a traceroute).

## Data-plane (p4)

### Includes

The files included in all our P4 programs are:

- ***headers.p4***: this defines the structure of packet headers and metadata used for all the various all the different P4 programs, such as the Ethernet, IPv4, UDP, TCP and ICMP packet structures.
- ***parser.p4***: defines the packet parsing and de-parsing process, extracting firstly the ethernet header, then either IPv4 or ICMP depending on the type field, then in IPv4 UDP or TCP.
- ***checksum.p4***: this defines the checks needed to verify and calculate the checksums.

### Firewall

The **firewall** consists of 2 tables. The first table entry_port is used to perform a match on the ingress port. When a packet enters the firewall, the Ingress controller retrieves the action associated with the ingress port (if not present, the packet is discarded). The associated action is set_nhop which replaces the egress port with the port in the argument in the corresponding table line. In the firewall, there are only two possible ports as it only has two links, so if a packet arrives on port packet arrives on port 1, it is sent to port 2 and vice versa. Then, if the set_nhop
action is performed, the filter_table is applied. This table matches the source and destination IP address and destination IP addresses, the transport protocol and the source and destination ports. If all the conditions are met, the packet is discarded and a counter is incremented. Entries in this table are added by the control-plane's add_rule method.

### Load Balancer

The **load balancer** consists of 2 tables. The first table, entry_port, is used to perform
a match on the ingress port. When a packet enters the load balancer, the Ingress controller retrieves the action associated with the ingress port (if not present, the packet is discarded). If the port is one of the of the ports in the outgoing flow, the associated action is set_nhop, which replaces the egress port with the port in the argument in the corresponding table line. However, if the port is the port of the incoming flow, the associated action is random_nhop which calculates the hash of the packet (according to the information: source and destination IP address, transport protocol, etc.). If this action is performed the load_balancer table is applied. It matches the packet hash. Each hash (between 1 and the number of ports in the outgoing flow) is associated with one of the ports in the outgoing flow. This makes it possible to send packets randomly to the node's outgoing flow neighbours.

### Router

The **router** consists of 2 tables. The first table, ipv4_lpm, is used to match the longest
the longest prefix of an IP address and the router's output port. When an packet enters the router, the Ingress controller will consult this table with the packet's destination address and will obtain as output, if routing of the packet is possible, a mac address as well as an output port and an action to be taken :

- If the next hop is to a host, apply the set_nhop_host action, which swaps the packet's mac
mac addresses of the packet, sets the output port, decrements the TTL and increments the received
received packets
- If the next hop is to a router, apply the set_nhop_router action, which swaps the packet's
mac addresses of the packet (in a different way to the previous action)n decrements the TTL
in increments the counter by the number of packets received.
- If there is no match, the action performed will be drop, which will simply discard the packet.
A second table is also used in the case of ICMP packets. If an IPv4 and TCP packet arrives with a TTL less than or equal to 1, then it sends an ICMP packet back to the sender using the icmp_ingress_port table, which gives the correspondence between the port on which the packet arrived and the IP of this port. The packet is sent back to the sender allowing a traceroute to be performed.

## API

Once the logical topology has been installed, the API can be accessed in the form of a CLI.
The commands implemented are:

- swap: the chosen node will be restarted with the chosen equipment. After the equipment has been launched on the node, the tables of all the routers to recalculate the shortest path between each node. 

```bash
swap <node_name> <equipment>
```

- see topology: displays the current network topology in the terminal with the type of device and the nodes to which it is connected. However, for a better understanding of the topology, we also produce a graph of the current topology in an image named graph.png with the name of each node and in green the hosts and in red the other equipment.

```bash
see topology
```

- change_weight: adds the chosen weight to the link between the 2 nodes and resets the router tables to recalculate all the shortest paths between the devices. As a result, packets are likely to change paths.

```bash
change_weight <node_1> <node_2> <weight>
```

- remove_link: removes the links between the 2 nodes in the logical topology topology and resets the routers' tables so that they no longer use this path in their calculation shortest path calculation.

```bash
remove_link <node_1> <node_2>
```

- add_link: adds a link between the 2 nodes to the logical topology (this link already exists in the physical topology) and resets the routers' tables to authorise them to use this path in their shortest path calculation.

```bash
add_link <node_1> <node_2>
```

- see filters: displays packets blocked by the firewall(s).

```bash
see filters
```

- see load: displays packets received for each device.

```bash
see load
```

- see tunneled: as we have not managed packet encapsulation, we have limited the command to display the packets received by the routers.

```bash
see tunneled
```

- add_fw_rule: adds a rule to block packets block packets matching the entries.

```bash
add_fw_rule <src_ip> <dst_ip> <udp | tcp> <src_port> <dst_port>
```

- set_rate_lb: limits the number of packets per second on the load balancer.

```bash
set_rate_lb <pkt/s>
```

## GitHub repository

[View on GitHub](<https://github.com/EthanAndreas/Rapace>)
