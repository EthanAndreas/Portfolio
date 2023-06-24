---
theme: page
---

# Network packets filter and analyzer

## Introduction

This project is a network packet filter and analyzer application. It is based on the [**libpcap**](https://www.tcpdump.org/) library, which allows to capture packets on a network interface. The program is written in C. It analyzes each layer of the OSI model (***physical***, ***network***, ***transport*** and ***application***) and displays the information contained in the protocol of each layer.

## Features

The application has three level of verbosity :

- **1** - Essential informations of the frame (one line by frame)
- **2** - Essential informations and their complements (one line by layer)
- **3** - All informations is printed   

The application can capture in two modes :

- **Live** : capture packets on a network interface
- **Offline** : read packets from a pcap file

The application can analyse the following protocols :

- **Physical** : Ethernet
- **Network** : ARP, IPv4, IPv6
- **Transport** : ICMP, SCTP, TCP, UDP
- **Application** : BOOTP, DHCP, DNS, FTP, HTTP, IMAP, POP3, SMTP, Telnet

The application can filter packets according to a protocol.

## GitHub repository

[View on GitHub](https://github.com/EthanAndreas/NetworkFrameFilter)
