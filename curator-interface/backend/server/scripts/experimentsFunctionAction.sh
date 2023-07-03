# Login into IBM Cloud CLI and target resource group and region
ibmcloud login --apikey $APIKEY -r $REGION -g $RESOURCE_GROUP

# Install IBM Cloud CLI Plugin for Cloud Functions
# ibmcloud plugin install cloud-functions -f

# Set the Namespace to create the Trigger
ibmcloud fn property set --namespace $FUNCTIONS_NAMESPACE_ID

# Bind the Trigger to a sequence
ibmcloud fn action invoke "watson-experiments-action" --param assistantCreds "$ASSISTANTCREDS" --param db2Creds "$DB2CREDS"
