###############################################################
#                                                             #
#                           DB2                               #
#                                                             #
###############################################################

# data "ibm_resource_instance" "db2" {
#   count             = length(var.db2_name) > 0 ? 1 : 0
#   name              = var.db2_name
#   location          = var.cloud_region
#   resource_group_id = data.ibm_resource_group.group.id
#   service           = "dashdb-for-transactions"
# }

resource "ibm_resource_instance" "db2" {
  count             = var.deploy_db2 ? 1 : 0
  name              = "db2-instance"
  service           = "dashdb-for-transactions"
  plan              = "standard"
  location          = var.cloud_region
  resource_group_id = data.ibm_resource_group.group.id

  timeouts {
    create = "90m"
  }
}

resource "ibm_resource_key" "db2" {
  count                = var.deploy_db2 ? 1 : 0
  name                 = "db2_curator_key"
  role                 = "Manager"
  resource_instance_id = ibm_resource_instance.db2[0].id
}
