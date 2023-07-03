###############################################################
#                                                             #
#                       CODE ENGINE                           #
#                                                             #
###############################################################

resource "random_string" "encription_iv" {
  length  = 16
  special = false
  upper   = false
}

resource "random_string" "encription_key" {
  length  = 32
  special = false
  upper   = false
}

resource "ibm_resource_instance" "codeengine" {
  name              = local.ce_project_name
  service           = "codeengine"
  plan              = "standard"
  location          = var.cloud_region
  resource_group_id = data.ibm_resource_group.group.id
}

# resource "ibm_cr_namespace" "namespace" {
#   name              = local.cr_namespace
#   resource_group_id = data.ibm_resource_group.group.id
# }

resource "null_resource" "codeengine" {
  provisioner "local-exec" {
    command = "/bin/bash scripts/codeengine.sh"

    environment = {
      APIKEY                 = var.ibmcloud_api_key
      RESOURCE_GROUP         = data.ibm_resource_group.group.id
      REGION                 = var.cloud_region
      PROJECT_NAME           = ibm_resource_instance.codeengine.name
      FUNCTIONS_NAMESPACE_ID = local.namespace_id
      ENCRIPTION_IV          = random_string.encription_iv.result
      ENCRIPTION_KEY         = random_string.encription_key.result
      # ICR_NS               = local.cr_namespace
      # GIT_REPO_URL         = var.git_repo_url
      # DOCKERFILE_DIRECTORY = var.dockerfile_directory
      DOCKER_IMAGE            = var.docker_image
      EXPERIMENTS_ACTIONS_URL = ibm_function_action.watson-experiments-actions.target_endpoint_url
      EXPERIMENTS_SKILLS_URL  = ibm_function_action.watson-experiments-skills.target_endpoint_url
    }
  }
}
