---
title: AZ-400 - Develop SRE strategy IV
published: true
description: |
  We have seen how Load Balancers are a great solution
  to allow for load distribution and ensure high-availability
  when working with parallel VMs. Now, let's dive deep into
  how to respond to health-check alerts of the machines 
  behind the LB.
category: Cloud
ctime: 2020-09-29
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/troubleshoot-inbound-connectivity-azure-load-balancer/).

# Troubleshoot inbound network connectivity for Azure Load Balancer

Learning objectives:
* Identify common load balancer inbound connectivity issues.
* Identify steps to resolve issues when virtual machines aren't responding to a health probe.

## Troubleshoot Azure Load Balancer

Load Balancer uses a health probe to determine the availability of each VM that's referenced by addresses in the back-end pool. Load Balancer only sends requests to VMs that indicate they're healthy. 

To recall how LB works, we need to review the components in it:
1. **Front-end IP that clients connect to**: The client does not know this is a LB, it just reaches an IP / DNS. Note that the LB can expose multiple front-end IP addresses and might have multiple back-end pools, so we can reuse it for multiple systems.
2. **Back-end pool VM addresses**: We can just add a new VM and add its IP to the pool. This will automatically be included when new requests arrive.
3. **One or more routing rules**: describing how requests to the front-end IP are mapped to the back-end pool. This way we can also specify the protocol and optionally, the source and destination ports. If some rule is not matched, the LB can discard the request. Moreover, recall how we discussed some strategies that could be used to ensure that the same user was always redirected to the same VM, allowing an easier treatment of stateful data in the app.
4. **A Health Probe**: A health probe sends regular ping messages to a port that you specify for the VMs in the back-end pool. You provide a service on the VMs that responds to these ping messages, with an HTTP 200 (OK) message. This allows the LB to know which VMs are alive and can be used to respond to requests.
5. **A collection of VMs in their own VNet**: The usage of a virtual network subnet allows us to secure the VMs inside via Network Security Groups (NSG), which implement inbound and outbound rules that can limit the traffic to a set of we-ll-defined endpoints. Usual open ports for inbound are 80 (HTTP) and 443 (HTTPS).

> OBS: If no health probe is provided the LB assumes that all VMs are responsive. Then, if a VM fails, the LB won't notice the failure and continues to route traffic to the failed VM. This issue causes requests to time out.

One strategy to select the VM address is a hash algorithm based on the following data:
* Source IP and port address of the client
* Destination IP address and port
* Network protocol

The hashed value is used as a key to a table that holds the IP addresses in the back-end pool.


### Symptoms and causes of failure with Load Balancer

If the LB loses connectivity to one VM, it might be because of:

* The application is unreachable.
* The VMs running the application are unreachable.
* Response times are slow.
* User requests are timing out.

While there might be many reasons, the most usual are:
* **Probing Issues**: when the VM fails to respond to the health probe requests. This may be caused by:
  * An incorrect probe configuration (wrong URL or port),
  * A VM unable to respond because the specified port is not open.
* **Data Path Issues**: when the LB is unable to route a client request to the app that runs on a VM in the back-end pool. Possible causes are:
  * NSG or FW rule blocking the ports or IPs used by the app,
  * VM is down or not responding due to failure or any other issue (e.g., expired certificate on the server). We should check if the VM responds to a ping, if we can access it, check the app is running, and finally run `netstat -an` to verify that the ports used by the health probe and application are listed as LISTENING.
  * The app is not responding, maybe because the VM is overloaded, the app is listening to an incorrect port or the app is simply crashing.

Other issues related to the VMs behind Load Balancer not responding to traffic on the probe port could be caused by trying to access the LB from a VM in the back-end, which would be an app design issue.

## Diagnose issues by reviewing configurations and metrics

Monitoring the performance of Azure LB might give an early warning for any possible failures. Azure Monitor provides many important metrics to examine trends in the performance of LB. We can also trigger alerts if one or more VMs fail health probe requests.

From a connectivity troubleshooting perspective, the most important metrics are Data Path Availability and Health Probe Status. We can check those using Azure Monitor.

As an example, if we have a Data Path Availability remain in a rather constant interval with its counts, but there a peak in Health Probe KOs, then it might be because a VM failure.

> OBS: It is also important the check the service health of the LB! We can do so in Service Health > Resource Health.

If we're monitoring the average packet count metric for a load balancer and the average packet count suddenly increases by a significant amount, although the number of clients doesn't appear to have changed. What is the most probable cause? One or more virtual machines in the back-end pool are no longer responding to health probe requests and are no longer participating in load balancing.

### Misconfigurations in Load Balancer

Validate the route through Load Balancer from the front end to the back-end pool. You can use tools such as PsPing on Windows, and TCPing and netsh, which are available for Windows and Linux.

#### PsPing

`psping -n 100 -i 0 -q -h <ip address>:<port>` will run 100 pings, in an interval of 0 seconds and will just output a summary and histogram in the end with the latency of the requests.

#### tcping

The tcping utility is similar to ping except that it operates over a TCP connection instead of ICMP, which Load Balancer doesn't route. Use tcping as `tcping <ip address> <port>`.

#### netsh

The netsh utility is a general-purpose network configuration tool. Use the trace command in netsh to capture network traffic. We can then analyze the output via Microsoft Message Analyzer or Wireshark. The usage would be

1. Start netsh: `netsh trace start ipv4.address=<ip address> capture=yes scenario=internetclient tracefile=trace.etl`
2. Send packets via PsPing: `psping -n 100 -i 0 -q <ip address>:<port>` to test the connectivity through LB
3. Stop tracing `netsh trace stop`.
4. Start Microsoft Message Analyzer, and open the trace file.
5. Add the following filter to the trace `TCP.Port==80 or TCP.Port==<LB-frontend-IP>`
6. Add the HTTP request source and destination as fields to the trace output.

### Limitations of Load Balancer

* Azure Load Balancer is limited to only load balancing and handling port-forwarding for the **TCP** and **UDP** protocols, we can't use ICMP.
* All client requests are terminated by a VM in the back-end pool. Load Balancer is invisible to clients. If no VMs are available, a client request will fail. Client applications can't communicate with, or otherwise interrogate the status of, Load Balancer or any of its components.
* If we need to configure balancing based on the contents of messages, a better option would be Azure App Gateway or directly configure a proxy.

