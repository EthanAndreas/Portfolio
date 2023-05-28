---
theme: page
---

# Cloud application deployment with Ansible

## Introduction

This project is a collection of scripts, configuration files and applications to deploy a cloud image hosting solution in an automated and resilient approach. The project is based on the following technologies :

- [**Consul**](https://www.consul.io/)
- [**Docker**](https://www.docker.com/)
- [**Keepalived**](https://www.keepalived.org/)
- [**Nomad**](https://www.nomadproject.io/)

## Application to be deployed

The application to be deployed is an online image hosting and resizing solution. It contains 3 parts : [**frontend**](https://github.com/EthanAndreas/CloudAppDeployment/tree/main/web), [**backend**](https://github.com/EthanAndreas/CloudAppDeployment/tree/main/api) and [**worker**](https://github.com/EthanAndreas/CloudAppDeployment/tree/main/api). The **frontend** corresponds to the web interface, where users upload the images they wish to store. The **backend** retrieves the uploaded images and stores them on an S3-type storage service. And finally, the **worker** part allows images to be resized.

## Architecture

For this project, we used a *3-node architecture* to deploy the application. These nodes correspond to *Virtual Machines*, which have an IP address (*192.168.70.\**) for *SSH* access to the machine and an IP address (*172.16.1.\**) for communication between them via *VXLAN tunnels*. All these *VMs* are configured as **Consul-Nomad** servers, one of which is automatically designated as the leader. The various parts of the application (frontend, backend, worker) are deployed via **Docker** containers. These containers are then deployed in a **Nomad job**, and listed and grouped as a **Consul service**.

<div align="center">
  <img src="/img/cloud-project/architecture-cloud.png" alt="Architecture" style="max-width: 100%;">
</div>

In addition, a **floating IP** address is configured to receive the *http* flow from the application on one of the *VMs* and distribute it to the various *frontend containers* with a **HAProxy** load balancer. In addition, a *proxy* is used to redirect *http* traffic from *<https://gare-centrale.100do.se/>* to the floating IP *172.16.3.4*. As a result, the application's web interface is located at this [URI](https://gare-centrale.100do.se/).

<div align="center">
  <img src="/img/cloud-project/floating-ip.png" alt="Floating IP" style="max-width: 50%;">
</div>

## Deploying the architecture

To deploy this architecture, we used **Ansible** to define the different *VM* configurations and deploy the application according to the previous architecture. A *playbook* is used for this purpose. 
The *playbook* contains the following files :

- [***playbook.yaml***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/playbook.yaml) : launch the various roles and their tasks
- [***inventory.yaml***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/inventory.yaml) : define the various configuration nodes
- [***reset.yaml***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/reset.yaml) : stop *Consul*, *Nomad*, *KeepAlived* and *Docker* services

It also contains a *roles* folder which defines the various task sequences to be executed :

- **Consul** : deploy [*consul.hcl*](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/consul/templates/consul.hcl) for each *VM* and start the service
- **Nomad** : deploy [*nomad.hcl*](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/nomad/templates/nomad.hcl) for each *VM*, start the service and run the jobs defined in *job.hcl*, which deploys the application
- **Docker** : start the service and add *Nomad* to the *Docker* group
- **KeepAlived** : deploy [*keepalived.conf*](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/keepalived/templates/keepalived.conf) for each *VM* and start the service

Each role has a *var directory*, which is used to define the characteristics of the architecture, in particular for **Nomad**, where the [*variables file*](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/nomad/vars/main.yml) is used to put the links to the *Git* directories of each **Docker** image of the application.

- Deploy **Ansible** and launch all *roles* :

```bash
ansible-playbook playbook/playbook.yaml -i playtbook/inventory.yaml 
```

- Deploy just one *role* :

```bash
ansible-playbook playbook/playbook.yaml -i playbook/inventory.yaml --tags "role"
```

- Stop all services :

```bash
ansible-playbook playbook/reset.yaml -i playbook/inventory.yaml
``` 

## Deploying a new version of the application

### Creating new Docker images

When updating the application (ie: api or frontend), the first step is to rebuild the **Docker** images. As this requires a **Github registry**, and therefore a login via credentials, it is not added to the **Ansible playbook**, so the user will have to place his images on a *Git*, and enter the *URIs* of the directories containing the images in the [***Nomad variables file***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/nomad/vars/main.yml).

Here are the commands needed to build the images :

- **Frontend** :

```bash
cd web
docker build -t frontend .
docker tag frontend "registry/frontend:tag"
docker push "registry/frontend:tag"
```

- **Backend** :

```bash
cd api
docker build -t worker .
docker tag worker "registry/worker:tag"
docker push "registry/worker:tag"
```

### Launching with Nomad

To deploy the new updated version of the application, you need to modify the *URIs* of the [***Nomad variables file***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/nomad/vars/main.yml), so that it takes the new images in the *job*, and then **launch Ansible only for the Nomad role**.

## Scheduled node maintenance
 
Following an update to a *node*, you need to **restart Ansible** for all roles, or just the role for which the service is being updated, **for that particular node** :

```bash
ansible-playbook playbook/playbook.yaml -i playbook/inventory.yaml --limit "node" --tags "role" 
``` 

It is also possible to stop all services for a particular node if you wish to make changes :

```bash
ansible-playbook playbook/reset.yaml -i playbook/inventory.yaml --limit "node"
```

## Horizontal scalability

To add a server, simply add a *node* to [***inventory.yaml***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/inventory.yaml). With the [architecture](#architecture) used, *3 nodes* are already configured :

```yaml
all:
  vars:
    ansible_user: ubuntu
    ansible_become: yes

  hosts:
    laiterie:
      vxlan_interface_address: 172.16.1.19
      priority: 244
    gallia:
      vxlan_interface_address: 172.16.1.13
      priority: 245
    hautepierre:
      vxlan_interface_address: 172.16.1.15
      priority: 246
```

So, *to add a node*, you add the *IP address* of the *node's VXLAN interface* and give it *priority* with regard to the allocation of the **floating IP** address via **KeepAlived**. Then, you have to *modify the number* of **Consul and Nomad servers** in their respective ***vars/main.yml*** files ([***consul variable file***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/consul/vars/main.yml) and [***nomad variable file***](https://github.com/EthanAndreas/CloudAppDeployment/blob/main/playbook/roles/nomad/vars/main.yml)).

And *to delete a node*, the procedure is the same, delete the corresponding *host*, and modify the number of **Consul** and **Nomad** servers in their respective ***vars/main.yml*** files.

## Impact in the event of breakdown
 
If a node breaks down, this would not be a problem. **Consul** would update its *catalog*, deleting all *nomad* and *nomad-client* instances connected to **Consul** and dependent on the node. **Nomad** would then update its *client-server list*, and the node would switch to *Down mode*. All *jobs* running on the node in question would be picked up by other nodes. Finally, since the node is down, it will no longer send *VRRP requests*, so another node would nominate itself to **KeepAlived** in order to recover the **floating IP** address.

## Limitations
 
One of the first limitations of the current implementation is that **HAProxy** does not redirect the flow from the **floating IP** address to the **frontend**. In fact, the connection must be made in the **HAProxy** configuration, where the **load balancer** must be told to connect the flow to **Consul's frontend services**. Another limitation of the implementation is that the **frontend** cannot communicate with the **backend**, as the **backend** does not respond to **frontend** requests on its port. A final limitation concerns **Nomad's implementation of jobs**. In fact, this implementation defines a *single job* for the application's various containers, but in order to add redundancy, it would be necessary to add *one job per container*.

## GitHub repository

[View on GitHub](https://github.com/EthanAndreas/CloudAppDeployment)
