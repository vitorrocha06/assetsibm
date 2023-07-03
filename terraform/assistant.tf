###############################################################
#                                                             #
#                        ASSISTANT                            #
#                                                             #
###############################################################

# data "ibm_resource_instance" "assistant" {
#   count             = length(var.assistant_name) > 0 ? 1 : 0
#   name              = var.assistant_name
#   location          = var.cloud_region
#   resource_group_id = data.ibm_resource_group.group.id
#   service           = "conversation"
# }

resource "ibm_resource_instance" "assistant" {
  count             = var.deploy_assistant ? 1 : 0
  name              = "assistant-instance"
  service           = "conversation"
  plan              = "free"
  location          = var.cloud_region
  resource_group_id = data.ibm_resource_group.group.id
}

resource "ibm_resource_key" "assistant" {
  count                = var.deploy_assistant ? 1 : 0
  name                 = "assistant_curator_key"
  role                 = "Manager"
  resource_instance_id = ibm_resource_instance.assistant[0].id
}
