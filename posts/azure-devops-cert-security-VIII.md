---
title: AZ-400 - Develop a Security Compliance Plan VIII
published: true
description: |
  In on-premises environment, usually only IT team
  was able to create and manage resources. Now however,
  we aim for a more flexible and agile workflow but this
  means that applying standards can become difficult.
  We can use Azure Policy to make sure that all
  resources are following the desired patterns.
category: Cloud
ctime: 2020-10-08
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/intro-to-governance/).

# Apply and monitor infrastructure standards with Azure Policy

Learning Objectives:
* Apply policies to control and audit resource creation
* Learn how role-based security can fine-tune access to your resources
* Understand Microsoft's policies and privacy guarantees
* Learn how to monitor your resources

## Define IT compliance with Azure Policy

With policies we can make sure our cloud infrastructure is consistent and allow us to enforce rules for created resources so that the infrastructure stays compliant with our corporate standards, cost requirements and SLAs.

Azure Policy is an Azure service to create, assign and, manage policies.

> OBS: RBAC focuses on user actions at different scopes, Azure Policy focuses on resource properties during deployment and for already-existing resources. Azure policies do not restrict access. Policies and RBAC solve different problems.

### Create a policy

To apply a policy we need to:
1. Create a policy definition - what to evaluate and what action to take (e.g., enforce HTTPS to public websites or limit the possible storage account SKUs)
2. Assign a definition to a scope of resources - Policy Assignment: what definition of the policy we apply at different scopes.
3. View policy evaluation results

Policy definitions are JSONs as the following example:

```json
{
  "if": {
    "allOf": [
      {
        "field": "type",
        "equals": "Microsoft.Compute/virtualMachines"
      },
      {
        "not": {
          "field": "Microsoft.Compute/virtualMachines/sku.name",
          "in": "[parameters('listOfAllowedSKUs')]"
        }
      }
    ]
  },
  "then": {
    "effect": "Deny"
  }
}
```

Notice the `[parameters('listofAllowedSKUs')]` value; this value is a replacement token that will be filled in when the policy definition is applied to a scope. When a parameter is defined, it's given a name and optionally given a value.

Then, to apply a policy we can go to the Portal or use Azure Powershell:

```powershell
# Register the resource provider if it's not already registered
Register-AzResourceProvider -ProviderNamespace 'Microsoft.PolicyInsights'

# Get a reference to the resource group that will be the scope of the assignment
$rg = Get-AzResourceGroup -Name '<resourceGroupName>'

# Get a reference to the built-in policy definition that will be assigned
$definition = Get-AzPolicyDefinition | Where-Object { $_.Properties.DisplayName -eq 'Audit VMs that do not use managed disks' }

# Create the policy assignment with the built-in definition against your resource group
New-AzPolicyAssignment -Name 'audit-vm-manageddisks' -DisplayName 'Audit VMs without managed disks Assignment' -Scope $rg.ResourceId -PolicyDefinition $definition
```

When a policy gets applied we can check what resources are not compliant either in the Portal > Policy Compliance or again with Powershell:

```powershell
Get-AzPolicyState -ResourceGroupName $rg.ResourceGroupName -PolicyAssignmentName 'audit-vm-manageddisks' -Filter 'IsCompliant eq false'
```

### Assign a definition to a scope of resources

With the policy above we had a parameter that needs to be filled. This is the scope of the resource. In the Portal, Powershell or Azure CLI we can then select the value of the List of Allowed virtual machine SKUs, for example.

### Policy effects

What happens when the policy is not matched? This are the policy effects, and each policy definition can have just one effect:

* **Deny**: The resource creation/update fails due to policy.
* **Disabled**:	The policy rule is ignored (disabled). Often used for testing.
* **Append**: Adds additional parameters/fields to the requested resource during creation or update, e.g., to add some tags.
* **Audit, AuditIfNotExists**:	Creates a warning event in the activity log when evaluating a non-compliant resource, but it doesn't stop the request.
* **DeployIfNotExists**: Executes a template deployment when a specific condition is met. For example, if SQL encryption is enabled on a database, then it can run a template after the DB is created to set it up a specific way.

## Organize policy with initiatives

An **initiative definition** is a set or group of policy definitions to help track us compliance state for a larger goal.

Like a policy assignment, an **initiative assignment** is an initiative definition assigned to a specific scope. Initiative assignments reduce the need to make several initiative definitions for each scope.

Once defined, initiatives can be assigned just as policies can - and they apply all the associated policy definitions.

As policies, initiatives can be creates in the Portal > Policy > Authoring > Initiative definition or via command line tools.

## Manage access, policies, and compliance across multiple Azure subscriptions

Planning and keeping rules consistent across subscriptions can be challenging without a little help.

### Manage subscriptions by using management groups

Azure Management Groups are containers for managing access, policies, and compliance across multiple Azure subscriptions. With Management Groups we can organize Azure resources hierarchically into collections, which provide a further level of classification that is above the level of subscriptions. All subscriptions within a management group automatically inherit the conditions applied to the management group.

For example, in a management group we can have the "development" collection with test subscription and a prod subscription, and another team with what subscription partitioning they might require. With inheritance, we just need to manage policies at the higher level required.

We can create management groups by using the Azure portal, Azure PowerShell, or Azure CLI.

Important facts about management groups:
* Any Azure AD user in the organization can create a management group. The creator is given an Owner role assignment.
* A single Azure AD organization can support 10,000 management groups.
* A management group tree can support up to six levels of depth not including the Root level or subscription level.
* Each management group can have many children.
* When your organization creates subscriptions, they are automatically added to the root management group.

## Define standard resources with Azure Blueprints

Azure Blueprints enables us to define a repeatable set of Azure resources that implements and adheres to an organization's standards, patterns, and requirements.

With Azure Blueprints we can rapidly build and deploy new environments with the assurance that we are following organization compliance using a set of built-in components, such as networking.

Azure Blueprints is a declarative way to **orchestrate** the deployment of various resource templates and other artifacts, such as:
* Role assignments
* Policy assignments
* Azure Resource Manager templates
* Resource groups

The process of implementing Azure Blueprint consists of the following high-level steps:
* Create an Azure Blueprint
* Assign the blueprint
* Track the blueprint assignments

### How is it different from Resource Manager templates?

ARM templates do not exist natively in Azure, as they usually live in source control systems. The template gets used for deployments of one or more Azure resources, but once those resources deploy there's no active connection or relationship to the template.

With Blueprints, the relationship between the blueprint definition (what should be deployed) and the blueprint assignment (what was deployed) is preserved (backed by a globally distributed CosmosDB). This connection supports improved tracking and auditing of deployments. Blueprints can also upgrade several subscriptions at once that are governed by the same blueprint.

There's no need to choose between a Resource Manager template and a blueprint. Each blueprint can consist of zero or more Resource Manager template artifacts. This support means that previous efforts to develop and maintain a library of Resource Manager templates are reusable in Blueprints.

### How it's different from Azure Policy

A blueprint is a package or container for composing focus-specific sets of standards, patterns, and requirements related to the implementation of Azure cloud services, security, and design that can be reused to maintain consistency and compliance.

A policy is a default-allow and explicit-deny system focused on resource properties during deployment and for already existing resources. It supports cloud governance by validating that resources within a subscription adhere to requirements and standards.

Including a policy in a blueprint enables the creation of the right pattern or design during assignment of the blueprint.

## Explore your service compliance with Compliance Manager

We do not only need to understand how we manage our solutions in the cloud, but also how the cloud provider manages the underlying resources.

Azure provides full transparency with four sources:

* **Microsoft Privacy Statement**: explains what personal data Microsoft processes, how it gets processed, and for what purposes.
* **Microsoft Trust Center**: explains how Microsoft implements and supports security, privacy, compliance, and transparency in all Microsoft cloud products and services. 
* **Service Trust Portal**: public site for publishing audit reports and other compliance-related information relevant to Microsoft's cloud services. It includes information about how Microsoft online services can help your organization maintain and track compliance with standards, laws, and regulations, such as GDPR, ISO, FedRAMP, SOC or NIST.
* **Compliance Manager**: workflow-based risk assessment dashboard within the Service Trust Portal that enables you to track, assign, and verify your organization's regulatory compliance activities related to Microsoft professional services and Microsoft cloud services such as Microsoft 365, Dynamics 365, and Azure.
