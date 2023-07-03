###############################################################
#                                                             #
#                 NATURAL LANGUAGE UNDERSTANDING              #
#                                                             #
###############################################################

# data "ibm_resource_instance" "nlu" {
#   count             = length(var.nlu_name) > 0 ? 1 : 0
#   name              = var.nlu_name
#   location          = var.cloud_region
#   resource_group_id = data.ibm_resource_group.group.id
#   service           = "natural-language-understanding"
# }

resource "ibm_resource_instance" "nlu" {
  count             = var.deploy_nlu ? 1 : 0
  name              = "nlu-instance"
  service           = "natural-language-understanding"
  plan              = "free"
  location          = var.cloud_region
  resource_group_id = data.ibm_resource_group.group.id
}

resource "ibm_resource_key" "nlu" {
  count                = var.deploy_nlu ? 1 : 0
  name                 = "nlu_curator_key"
  role                 = "Manager"
  resource_instance_id = ibm_resource_instance.nlu[0].id
}
