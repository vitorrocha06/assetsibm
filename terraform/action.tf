###############################################################
#                                                             #
#                     CLOUD FUNCTIONS                         #
#                                                             #
###############################################################

data "ibm_function_namespace" "namespace" {
  count = length(var.namespace) > 0 ? 1 : 0
  name  = var.namespace
}

resource "ibm_function_namespace" "namespace" {
  count             = length(var.namespace) > 0 ? 0 : 1
  name              = length(var.namespace) > 0 ? var.namespace : "assistant-curator-functions"
  resource_group_id = data.ibm_resource_group.group.id
}

data "archive_file" "cloud-functions-actions" {
  count       = length(local.actions)
  type        = "zip"
  source_dir  = "../cloud-functions/action-assistant/${local.actions[count.index].name}"
  output_path = "../cloud-functions/action-assistant/${local.actions[count.index].name}.zip"
}

data "archive_file" "cloud-functions-skills" {
  count       = length(local.actions)
  type        = "zip"
  source_dir  = "../cloud-functions/skill-assistant/${local.actions[count.index].name}"
  output_path = "../cloud-functions/skill-assistant/${local.actions[count.index].name}.zip"
}

resource "ibm_function_action" "actions" {
  count     = length(local.actions)
  name      = "actions-${local.actions[count.index].name}"
  namespace = local.namespace_name
  # user_defined_parameters = local.actions[count.index].user_defined_parameters

  exec {
    code_path = "../cloud-functions/action-assistant/${local.actions[count.index].name}.zip"
    kind      = "nodejs:12"
  }
}

resource "ibm_function_action" "skills" {
  count     = length(local.actions)
  name      = "skills-${local.actions[count.index].name}"
  namespace = local.namespace_name
  # user_defined_parameters = local.actions[count.index].user_defined_parameters

  exec {
    code_path = "../cloud-functions/skill-assistant/${local.actions[count.index].name}.zip"
    kind      = "nodejs:12"
  }
}

resource "ibm_function_action" "actions-sequence" {
  name      = "assistant-curator-actions"
  namespace = local.namespace_name

  exec {
    kind       = "sequence"
    components = [for o in ibm_function_action.actions : "/${local.namespace_id}/${o.name}"]
  }
}

resource "ibm_function_action" "skills-sequence" {
  name      = "assistant-curator-skills"
  namespace = local.namespace_name

  exec {
    kind       = "sequence"
    components = [for o in ibm_function_action.skills : "/${local.namespace_id}/${o.name}"]
  }
}

# resource "ibm_function_trigger" "trigger" {
#   name      = "curation-trigger"
#   namespace = local.namespace_name
#   feed {
#     name       = "/whisk.system/alarms/alarm"
#     parameters = <<EOF
# 				[
# 					{
# 						"key":"cron",
# 						"value":"0 9 * * *"
# 					}
# 				]
# 	  	  EOF
#   }
# }

# resource "ibm_function_rule" "rule" {
#   name         = "curator"
#   namespace    = local.namespace_name
#   trigger_name = ibm_function_trigger.trigger.name
#   action_name  = ibm_function_action.sequence.name
# }

# WATSON EXPERIMENTS CLOUD FUNCTION

data "archive_file" "experiments-actions" {
  type        = "zip"
  source_dir  = "../cloud-functions/action-assistant/watson-experiments-cf"
  output_path = "../cloud-functions/action-assistant/watson-experiments-cf.zip"
}

data "archive_file" "experiments-skills" {
  type        = "zip"
  source_dir  = "../cloud-functions/skill-assistant/watson-experiments-cf"
  output_path = "../cloud-functions/skill-assistant/watson-experiments-cf.zip"
}

resource "ibm_function_action" "watson-experiments-actions" {
  name      = "watson-experiments-cf-actions"
  namespace = local.namespace_name
  limits {
    timeout = 130000
  }

  exec {
    code_path = "../cloud-functions/action-assistant/watson-experiments-cf.zip"
    image     = "iisbrasil/experiment-package"
    kind      = "blackbox"
  }
}

resource "ibm_function_action" "watson-experiments-skills" {
  name      = "watson-experiments-cf-skills"
  namespace = local.namespace_name
  limits {
    timeout = 130000
  }

  exec {
    code_path = "../cloud-functions/skill-assistant/watson-experiments-cf.zip"
    image     = "iisbrasil/experiment-package"
    kind      = "blackbox"
  }
}
