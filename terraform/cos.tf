###############################################################
#                                                             #
#                   CLOUD OBJECT STORAGE                      #
#                                                             #
###############################################################

# data "ibm_resource_instance" "cos" {
#   count             = length(var.cos_name) > 0 ? 1 : 0
#   name              = var.cos_name
#   resource_group_id = data.ibm_resource_group.group.id
#   service           = "cloud-object-storage"
# }

resource "ibm_resource_instance" "cos" {
  count             = var.deploy_cos ? 1 : 0
  name              = "cos-instance"
  resource_group_id = data.ibm_resource_group.group.id
  service           = "cloud-object-storage"
  plan              = "lite"
  location          = "global"
}

# data "ibm_cos_bucket" "bucket" {
#   count                = length(var.bucket_name) > 0 ? 1 : 0
#   bucket_name          = var.bucket_name
#   resource_instance_id = local.cos_id
#   bucket_type          = "region_location"
#   bucket_region        = var.cloud_region
# }

resource "ibm_cos_bucket" "bucket" {
  count                = var.create_bucket ? 1 : 0
  bucket_name          = "assistant-curator-${formatdate("DDMMYYYYhhmmss", timestamp())}"
  resource_instance_id = ibm_resource_instance.cos[0].id
  region_location      = var.cloud_region
  storage_class        = "smart"
}
