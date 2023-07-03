# Login into IBM Cloud CLI and target resource group and region
ibmcloud login --apikey $APIKEY -r $REGION -g $RESOURCE_GROUP

# Install IBM Cloud CLI Plugin for Cloud Functions
# ibmcloud plugin install cloud-functions -f

# Set the Namespace to create the Trigger
ibmcloud fn property set --namespace $FUNCTIONS_NAMESPACE_ID

echo TRIGGER_NAME 
echo $TRIGGER_NAME 
echo DB_CONFIG 
echo "$DB_CONFIG"
echo ASSISTANT_CONFIG 
echo $ASSISTANT_CONFIG 
echo NLU_CONFIG 
echo $NLU_CONFIG 
echo COS_CONFIG 
echo $COS_CONFIG 
echo CLOUDANT_CONFIG
echo $CLOUDANT_CONFIG

# Create the Trigger using the provided parameters
ibmcloud fn trigger create $TRIGGER_NAME --feed /whisk.system/alarms/alarm --feed-param cron "$PERIODICITY" \
--trigger-param dbConfig "$DB_CONFIG" \
--trigger-param assistantConfig "$ASSISTANT_CONFIG" \
--trigger-param nluConfig "$NLU_CONFIG" \
--trigger-param cosConfig "$COS_CONFIG" \
--trigger-param cloudantConfig "$CLOUDANT_CONFIG"

# Bind the Trigger to a sequence
ibmcloud fn rule create $RULE_NAME $TRIGGER_NAME "assistant-curator-skills"