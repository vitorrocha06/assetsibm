locals {
  cr_namespace = "assistant-curator-${formatdate("DDMMYYYYhhmm", timestamp())}"
  # db2_jdbc        = replace(ibm_resource_key.db2.credentials["connection.db2.jdbc_url.0"], "user=<userid>;password=<your_password>;", "")
  ce_project_name = "assistant-curator-${formatdate("DDMMYYYYhhmmss", timestamp())}"
  # nlu_id          = length(var.nlu_name) > 0 ? data.ibm_resource_instance.nlu[0].id : ibm_resource_instance.nlu[0].id
  # db2_id          = length(var.db2_name) > 0 ? data.ibm_resource_instance.db2[0].id : ibm_resource_instance.db2[0].id
  # cloudant_id  = length(var.cloudant_name) > 0 ? data.ibm_cloudant.cloudant[0].id : ibm_cloudant.cloudant[0].id
  # cognos_id    = length(var.cognos_name) > 0 ? data.ibm_resource_instance.cognos[0].id : ibm_resource_instance.cognos[0].id
  # assistant_id = length(var.assistant_name) > 0 ? data.ibm_resource_instance.assistant[0].id : ibm_resource_instance.assistant[0].id
  # cos_id          = length(var.cos_name) > 0 ? data.ibm_resource_instance.cos[0].id : ibm_resource_instance.cos[0].id
  # bucket_name    = length(var.bucket_name) > 0 ? var.bucket_name : ibm_cos_bucket.bucket[0].bucket_name
  # cos_endpoint   = length(var.bucket_name) > 0 ? data.ibm_cos_bucket.bucket[0].s3_endpoint_private : ibm_cos_bucket.bucket[0].s3_endpoint_private
  # cos_crn        = length(var.bucket_name) > 0 ? data.ibm_cos_bucket.bucket[0].crn : ibm_cos_bucket.bucket[0].crn
  namespace_id   = length(var.namespace) > 0 ? data.ibm_function_namespace.namespace[0].id : ibm_function_namespace.namespace[0].id
  namespace_name = length(var.namespace) > 0 ? var.namespace : ibm_function_namespace.namespace[0].name
  actions = [
    {
      "name" : "create-tables-cf",
    },
    {
      "name" : "process-logs-cf",
    },
    {
      "name" : "process-conversations-cf",
    },
    {
      "name" : "enrichment-cf",
    },
    {
      "name" : "insert-logs-cf",
    }
  ]
}
