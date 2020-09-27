---
title: AZ-400 - Develop a Security Compliance Plan II
published: true
description: |
  After taking a look at some concepts and features
  of Azure Active Directory, we are now ready to
  check how to manage users and groups and even
  invite guests to our tenant.
category: Cloud
ctime: 2020-10-02
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/create-users-and-groups-in-azure-active-directory/).

# Create Azure users and groups in Azure Active Directory

Learning Objectives:
* Add users to Azure Active Directory.
* Manage app and resource access by using Azure Active Directory groups.
* Give guest users access in Azure Active Directory business to business (B2B).

## What are user accounts in Azure Active Directory?

A user's account access consists of the type of user, their role assignments, and their ownership of individual objects.

**Roles** are used to manage and grant permissions. When a user is assigned a specific role, they inherit permissions from that role. E.g., a user assigned to the User Administrator role can create and delete user accounts.

* **Administrator roles**: allow users elevated access to control who is allowed to do what.
* **Member users**: default permissions like being able to manage their profile information. They are native members of AAD.
* **Guest users**: restricted AAD organization permissions, and they are users invited (using AAD B2B) to our tenant.

> OBS: By default, Azure AD member users can invite guest users. This default can be disabled by someone who has the User Administrator role.

### Add user accounts

Admins can create new AAD accounts with Azure CLI: `az ad user create` or PowerShell: `New-AzureADUser`.

To invite guest users, we can run `New-AzureADMSInvitation` PowerShell cmd.

### Delete user accounts

Admins can delete existing AAD accounts with `az ad user delete` or `Remove-AzureADUser`.

When you delete a user, the account remains in a suspended state for 30 days. During that 30-day window, the user account can be restored.

## Manage app and resource access by using Azure Active Directory groups

* **Azure AD roles**: to manage AAD-related resources like users, groups, billing, licensing, application registration, and more.
* **Role-based access control (RBAC) for Azure resources**: to manage access to Azure resources like virtual machines, SQL databases, or storage.

AAD helps you provide access rights to a single user or to an entire group of users. You can assign a set of access permissions to all the members of the group.

There are different ways you can assign access rights:
* **Direct assignment**: Assign a user the required access rights by directly assigning a role that has those access rights.
* **Group assignment**: Assign a group the required access rights, and members of the group will inherit those rights.
* **Rule-based assignment**: Use rules to determine a group membership based on user or device properties. E.g., a user is from USA.


### Collaborate by using guest accounts and Azure Active Directory B2B

With Azure Active Directory B2B, you don't have to manage your external users' identities. The partner has the responsibility to manage its own identities. External users continue to use their current identities to collaborate with your organization. We are just giving them access to our organization, nothing more.

To manage guest users' permissions, we first need to add them to the organization: Azure Active Directory > Users > New guest user. Afterwards, they can be added to groups or applications as usual. If guests do not answer our invitations, we can resend those in AAD > Users > Select user > Resend invitation.
