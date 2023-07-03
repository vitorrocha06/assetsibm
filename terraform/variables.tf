###############################################################
#                                                             #
#                        IBM CLOUD                            #
#                                                             #
###############################################################

variable "ibmcloud_api_key" {
  description = "Secret from IBM Cloud to grant acces to interact with cloud resources. See more about it: https://www.ibm.com/docs/en/app-connect/containers_cd?topic=servers-creating-cloud-api-key"
  type        = string
}

variable "cloud_region" {
  description = "Region to create the resources, and where the existing resources are. See the availabe regions here: https://cloud.ibm.com/docs/certificate-manager?topic=certificate-manager-regions-endpoints#regions"
  type        = string
}

variable "resource_group" {
  description = "Resource group to associate with the services instances. See your resource groups here: https://cloud.ibm.com/account/resource-groups"
  type        = string
}

###############################################################
#                                                             #
#                       CODE ENGINE                           #
#                                                             #
###############################################################

variable "docker_image" {
  description = "The Docker Image used to create the application in Code Engine./nIf you make changes to your Assistant Curator, you MUST save your Image in a new Container Hub and change this variable. "
  type        = string
  default     = "giokiszibm/curator-teste-giokisz"
}

# variable "git_repo_url" {
#   description = "The HTTPS link to your GitHub Repository root directory.\nSee how you can get this link here: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository#cloning-a-repository."
#   type        = string
# }

# variable "dockerfile_directory" {
#   description = "The location of the Dockerfile in the Git Repository.\nOnly need to change if you change the Dockerfile directory."
#   default     = "curator-interface/backend"
#   type        = string
# }

###############################################################
#                                                             #
#                     CLOUD FUNCTIONS                         #
#                                                             #
###############################################################

variable "namespace" {
  description = "The namespace used to create the Cloud Function Actions.\nIf no namespace is provided, the default 'assistant-curator-functions' will be created."
  type        = string
  default     = ""
}

# variable "skillID" {
#   description = "The skill ID of your Watson Assistant.\nIf you don't have one yet, referal to the documeation later to add it."
#   type        = string
#   default     = ""
# }

###############################################################
#                                                             #
#                   CLOUD OBJECT STORAGE                      #
#                                                             #
###############################################################

variable "deploy_cos" {
  description = "If marked as true, the default 'cos-instance' will be created."
  type        = bool
  default     = false
}

variable "create_bucket" {
  description = "If marked as true, the default 'assistant-curator' bucket will be created."
  type        = bool
  default     = false
}

###############################################################
#                                                             #
#                 NATURAL LANGUAGE UNDERSTANDING              #
#                                                             #
###############################################################

variable "deploy_nlu" {
  description = "If marked as true, the default 'nlu-instance' will be created."
  type        = bool
  default     = false
}

###############################################################
#                                                             #
#                           DB2                               #
#                                                             #
###############################################################

variable "deploy_db2" {
  description = "If marked as true, the default 'db2-instance' will be created."
  type        = bool
  default     = false
}

###############################################################
#                                                             #
#                         CLOUDANT                            #
#                                                             #
###############################################################

# variable "has_lite_cloudant" {
#   description = "To prevent erros creating your Cloudant instance, use this variable to inform if you already has any LITE Cloudant Instance in your account.\nIf you change this variable to True, a Standard Cloudant instance will be created."
#   type        = bool
#   default     = false
# }

variable "deploy_cloudant" {
  description = "If marked as true, the default 'cloudant-instance' will be created."
  type        = bool
  default     = false
}

###############################################################
#                                                             #
#                        ASSISTANT                            #
#                                                             #
###############################################################

variable "deploy_assistant" {
  description = "If marked as true, the default 'assistant-instance' will be created."
  type        = bool
  default     = false
}

###############################################################
#                                                             #
#                      COGNOS EMBEDED                         #
#                                                             #
###############################################################

variable "deploy_cognos" {
  description = "If marked as true, the default 'cognos-instance' will be created."
  type        = bool
  default     = false
}
