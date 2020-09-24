---
title: AZ-400 - Develop an Instrumentation Strategy II
published: true
description: |
  With Azure we have a lot of freedom when creating and managing services.
  However, it is also important to define some standards to better control
  what we have, who it belongs to, and where it is used. Now it is time
  to control and organize Azure Resources. 
category: Cloud
ctime: 2020-09-21
---

Having a tidy cloud environment means that it is easier to control which services belong to what project / team, manage billing and also monitoring and accesses. It won't just allow us to have a better view on what we have, but it will help us reduce mistakes and ease the administration work.

The content for this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/control-and-organize-with-azure-resource-manager/). If some of you have already studied for Azure Fundamentals exam, then you might have already read through this.

# Control and organize Azure resources with Azure Resource Manager

Learning objectives:
* Use resource groups to organize Azure resources
* Use tags to organize resources
* Apply policies to enforce standards in your Azure environments
* Use resource locks to protect critical Azure resources from accidental deletion

## Principles of resource groups

Let's start with the description of this key concept: **A resource group is a logical container for resources deployed on Azure**. All services must belong to one, and just one, resource group. Moreover, RGs cannot be nested.

We can think of them as the partition of projects & environments, making it easier to group together related services. They are also useful when scoping RBAC permissions and to delete services as a bulk during experimentation phases, as by deleting the RG, everything inside will also be removed.

Here we can follow different strategies when defining the boundaries for different RGs. I might be interested in having all VNets together, differentiating by department or per environment, and then scope permissions directly at RG level for different roles and envs.

Resource Groups can be created via the Azure Portal, Azure CLI, Powershell, Templates and different SDKs.

## Use tagging to organize resources

We can add key-pair values to our resources (up to 50) called tags, which allow us to identify resources by department, creator, environment, cost center... They are even useful to control lifecycle and automation, as we can query resources by tag.

> OBS: Tags aren't inherited from parent resources. Not all resource types support tags, and tags can't be applied to classic resources. You can also use Azure Policy to automatically add or enforce tags for resources your organization creates based on policy conditions that you define

We can manage tags with the Portal, Azure CLI, Powershell and ARM templates. For example, with Azure CLI:

```
az resource tag --tags Department=Finance \
    --resource-group msftlearn-core-infrastructure-rg \
    --name msftlearn-vnet1 \
    --resource-type "Microsoft.Network/virtualNetworks"
```

Note that by default the `tags` column is not displayed in the Portal. We can change that by clicking "Edit Columns" and select "Tags".

## Use policies to enforce standards

Policies are a great way to ensure that new resources follow a predefined set of rules.

Azure Policy is a service you can use to create, assign, and manage policies. Policies are then used to enforce rules on services when they are created and can be evaluated against existing resources to check compliance.

A possible rule would be that all resources must have a `Department` tag. For example, one could be created in the Portal following the next JSON:

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "field": "[concat('tags[', parameters('tagName'), ']')]",
      "exists": "false"
    },
    "then": {
      "effect": "deny"
    }
  },
  "parameters": {
    "tagName": {
      "type": "String",
      "metadata": {
        "displayName": "Tag Name",
        "description": "Name of the tag, such as 'environment'"
      }
    }
  }
}
```

After creating a policy, it needs to be assigned for it to get into work. In the policy pane, select Assignments from the Authoring section on the left. Then, when a new resource is created, it will only be OK if the validation passes the assigned policies.

Another usage could be to enforce naming conventions, which is useful to maintain a desired order.

## Secure resources with role-based access control

RBAC is considered a core service and is included with all subscription levels at no cost. It allows us to grant users the specific permissions they need for each of the different resources.

We can access these permissions in the **Access Control (IAM)** panel for each resource. If we have different roles assigned with different permissions, the final set of permissions will be applied.

As a general rule of thumb, grant users the lowest privilege level that they need to do their work and use **resource locks** to disable resource modification or deletion.

## Use resource locks to protect resources

Resource locks can set to either Delete or Read-only. Delete will allow all operations against the resource but block the ability to delete it. Read-only will only allow read activities to be performed against it, blocking any modification or deletion of the resource.

To perform a blocked action by a lock, we first need to manually disable the lock, adding another layer of security.

Locks can be managed at service level in Settings > Locks.
