###############################################################
#                                                             #
#                         CLOUDANT                            #
#                                                             #
###############################################################

# data "ibm_cloudant" "cloudant" {
#   count             = length(var.cloudant_name) > 0 ? 1 : 0
#   resource_group_id = data.ibm_resource_group.group.id
#   name              = var.cloudant_name
# }

resource "ibm_cloudant" "cloudant" {
  count             = var.deploy_cloudant ? 1 : 0
  name              = "cloudant-instance"
  location          = var.cloud_region
  plan              = "lite"
  resource_group_id = data.ibm_resource_group.group.id

  timeouts {
    create = "90m"
  }
}

resource "ibm_resource_key" "cloudant" {
  count                = var.deploy_cloudant ? 1 : 0
  name                 = "cloudant_curator_key"
  role                 = "Manager"
  resource_instance_id = ibm_cloudant.cloudant[0].id
}
