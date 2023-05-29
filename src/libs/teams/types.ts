export interface Channel {
  id: string;
  createdDateTime: Date;
  displayName: string;
  description: string;
  isFavoriteByDefault?: any;
  email: string;
  tenantId: string;
  webUrl: string;
  filesFolderWebUrl: string;
  membershipType: "standard" | "private";
  summary?: any;
  moderationSettings?: any;
}

export interface Member {
  id: string;
  roles: Array<"owner">;
  displayName: string;
  visibleHistoryStartDateTime: Date;
  userId: string;
  email: string;
  tenantId: string;
}

export interface AssignedLicens {
  disabledPlans: string[];
  skuId: string;
}

export interface AssignedPlan {
  assignedDateTime: Date;
  capabilityStatus: string;
  service: string;
  servicePlanId: string;
}

export interface AuthorizationInfo {
  certificateUserIds: any[];
}

export interface DeviceKey {
  deviceId: string;
  keyMaterial: string;
  keyType: string;
}

export interface Identity {
  signInType: string;
  issuer: string;
  issuerAssignedId: string;
}

export interface OnPremisesExtensionAttributes {
  extensionAttribute1?: any;
  extensionAttribute2?: any;
  extensionAttribute3?: any;
  extensionAttribute4?: any;
  extensionAttribute5?: any;
  extensionAttribute6?: any;
  extensionAttribute7?: any;
  extensionAttribute8?: any;
  extensionAttribute9?: any;
  extensionAttribute10?: any;
  extensionAttribute11?: any;
  extensionAttribute12?: any;
  extensionAttribute13?: any;
  extensionAttribute14?: any;
  extensionAttribute15?: any;
}

export interface ProvisionedPlan {
  capabilityStatus: string;
  provisioningStatus: string;
  service: string;
}

export interface User {
  id: string;
  deletedDateTime?: any;
  accountEnabled: boolean;
  ageGroup?: any;
  businessPhones: any[];
  city?: any;
  createdDateTime: Date;
  creationType?: any;
  companyName?: any;
  consentProvidedForMinor?: any;
  country?: any;
  department?: any;
  displayName: string;
  employeeId?: any;
  employeeHireDate?: any;
  employeeLeaveDateTime?: any;
  employeeType?: any;
  faxNumber?: any;
  givenName: string;
  imAddresses: string[];
  infoCatalogs: any[];
  isManagementRestricted?: any;
  isResourceAccount?: any;
  jobTitle?: any;
  legalAgeGroupClassification?: any;
  mail: string;
  mailNickname: string;
  mobilePhone?: any;
  onPremisesDistinguishedName?: any;
  officeLocation?: any;
  onPremisesDomainName?: any;
  onPremisesImmutableId: string;
  onPremisesLastSyncDateTime?: any;
  onPremisesSecurityIdentifier: string;
  onPremisesSamAccountName?: any;
  onPremisesSyncEnabled?: any;
  onPremisesUserPrincipalName?: any;
  otherMails: any[];
  passwordPolicies: string;
  postalCode?: any;
  preferredDataLocation?: any;
  preferredLanguage: string;
  proxyAddresses: string[];
  refreshTokensValidFromDateTime: Date;
  securityIdentifier: string;
  showInAddressList?: any;
  signInSessionsValidFromDateTime: Date;
  state?: any;
  streetAddress?: any;
  surname: string;
  usageLocation: string;
  userPrincipalName: string;
  externalUserConvertedOn?: any;
  externalUserState?: any;
  externalUserStateChangeDateTime?: any;
  userType: string;
  employeeOrgData?: any;
  passwordProfile?: any;
  assignedLicenses: AssignedLicens[];
  assignedPlans: AssignedPlan[];
  authorizationInfo: AuthorizationInfo;
  deviceKeys: DeviceKey[];
  identities: Identity[];
  onPremisesExtensionAttributes: OnPremisesExtensionAttributes;
  onPremisesProvisioningErrors: any[];
  provisionedPlans: ProvisionedPlan[];
}
