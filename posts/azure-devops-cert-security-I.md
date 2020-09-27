---
title: AZ-400 - Develop a Security Compliance Plan I
published: true
description: |
  Azure Active Directory (AAD) is a cloud-based identity 
  and access management solution used to secure internal, 
  external, and customer identities. Let's take a look
  at the usage and features of AAD.
category: Cloud
ctime: 2020-10-01
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/intro-to-azure-ad/).

# Secure your identities by using Azure Active Directory

Learning objectives:
* Describe the core terminology of Azure AD.
* Describe the core features of Azure AD.
* Describe the licensing models for Azure AD.

## Azure Active Directory overview

AAD is a cloud-based identity management solution. It helps employees to access both internal applications & external resources, like Azure services, MS 365 and third-party SaaS applications.

It allows to manage conditional access and identity protection.

Users are stored in a **tenant** that represents an organization, and then we can create groups so users have shared-access level permissions. 

> OBS: AAD is different from "Active Directory", as the later it is used for authentication and authorization for on-premises printers, applications, file services, etc. and its structure and auth methods are also different.

### Identity secure score in Azure AD

AAD gives an overall value between 1 and 223. This value represents how well you match the recommendations and best practices that Microsoft suggests for tenant security. The identity secure score reveals how effective your security is and helps you implement improvements. This score can be reviewed in the portal.

### Hybrid identity for linking on-premises Active Directory with Azure AD

With different auth methods, a single user identity can be used to access both cloud and on-prem apps and resources:
* **Azure AD password hash synchronization**: where passwords are hashed and shared both onprem and cloud.
* **Azure AD pass-through authentication**: where an agent installed onprem has the AAD pwd and authenticates AAD identities.
* **Federated authentication**: auth process is performed by an on-premises Active Directory Federation Services (AD FS) server that validates users' passwords. This is the method that can handle most of the possible scenarios as onprem MFA auth or smart card auth.

### European identity data storage

Note that most of the data is going to be stored in Europe datacenters if your address during the subscription process is from Europe. However, some policy data (not personal) and MFA phone calls can happen outside Europe.

## Understand Azure AD licenses and terminology

Different licenses mean different features. Licenses can be managed in Azure Active Directory > Licenses > All products, and we can try or buy new licenses.

* **Azure Active Directory Free**: Manage users and groups, basic reports, onprem AD synch, self-service pwd reset for AAD users, single sign-on for MS 365, Azure services and many third party SaaS solutions.
* **Azure Active Directory Premium P1**: This also lets users access on-premises and cloud-based services and resources. You can use self-service group management or dynamic groups, where users are added and removed automatically, based on your criteria. It also supports onprem suites like MS Identity Management and self-service pwd reset for onprem based users.
* **Azure Active Directory Premium P2**: Also gives us AD Identity Protection. This feature helps you configure risk-based conditional access to protect applications from identity risks. You can also use privileged identity management, which lets you monitor and put detailed restrictions on administrators.
* **Pay-as-you-go licenses for specific features**: You access specific Azure AD features, like Azure AD B2C, on a pay-as-you-go basis. Azure AD B2C lets you manage identity and access for consumer users and the applications they use.

### Azure AD terminology

Some definitions:

* **Identity**: Something that has to be identifies, be it a user, application or service.
* **Account**: An identity and its associated data. An account can't exist without an identity.
* **Azure AD account**: An identity created in Azure AD or in services like Microsoft 365.
* **Azure subscription**: Level of access to use Azure and its services. Account 1:* Subscriptions
* **Azure AD tenant**: An instance of an Azure AD - represents an organization, holds your users, their groups, and applications.
* **Multi-tenant**: Multiple-tenant access to the same applications and services in a shared environment. These tenants represent multiple organizations.
* **Azure AD directory**: An Azure resource that's created for you automatically when you subscribe to Azure. You can create many Azure AD directories. Each of these directories represents a tenant.
* **Custom domain**: A domain that you customize for your Azure AD directory.
* **Owner role**: The role you use to manage all resources in Azure, including the access levels that users need for resources.
* **Global administrator**: The role that gives you access to all administrative capabilities in Azure AD. When you create a tenant, you automatically have this role for the tenant. This role allows you to reset passwords for all users and administrators.

### Default user permissions

The set of permissions granted by default depends on whether a user is a natural member of the tenant (like an internal employee) or a member of an outside organization (guest). Guests are invited to the tenant via AAD B2B. Members usually have more permissions than guests, like managing their own profile and anything related to policies, subscription, roles and scopes. Users can register new applications, while guests can only deleted owned apps. Regarding Devices, users have full access while guests have read and manage permissions and can just delete owned devices.

## Essential features of Azure AD

* **Azure AD B2B**: to invite external users to your tenant. Available in all tiers.
* **Azure AD B2C**: to manage your customers' identities and access. It also monitors brute force attacks and DDoS. To use it, you register an application and then configure user flows to set up the user's journey to access an application.
* **Azure AD DS**: to add VMs to a domain without needing domain controllers. Your internal staff users can access virtual machines by using their company Azure AD credentials. Use this service to reduce the complexity of migrating on-premises applications to Azure.
* **Application management**: to manage user access for all applications:
  * Azure AD App Gallery applications - apps that can be found in the Marketplace
  * Custom applications - You can register your company-built applications with Azure AD.
  * Non-gallery applications - You can manually add any applications that you don't see in the gallery.
  * On-premises applications - You can add on-premises applications by configuring Azure AD Application Proxy
* **Protect your apps through conditional-access policies**: for example forcing MFA before users can access an app
* **Monitor your application access**: monitor your application sign-ins by generating reports that cover sign-in dates, user details, applications the user has used, risk detection, location and more.
* **Azure AD Identity Protection**: to detect, investigate, and remediate identity risks for users. Identity Protection uses risk policies to automatically detect and respond to threats. You configure a risk policy to set up how Identity Protection should respond to a particular type of risk.
