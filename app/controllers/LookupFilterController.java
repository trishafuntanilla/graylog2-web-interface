package controllers;

import com.google.common.io.Files;
import lib.BreadcrumbList;
import play.Logger;
import play.mvc.BodyParser;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;
import java.io.File;
import java.nio.charset.StandardCharsets;
import org.bson.Document;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import lib.Global;

public class LookupFilterController extends AuthenticatedController {

    private static final String mongoHost = Global.mongoHost;
    private static final String mongoDatabase = Global.mongoDatabase;
    private static final String mongoCollection = "lookup";
    
    @Inject
    public LookupFilterController() {
    }
    
    public Result index() {
        
        BreadcrumbList bc = new BreadcrumbList();
        bc.addCrumb("System", routes.SystemController.index(0));
        bc.addCrumb("Lookup Filter", routes.LookupFilterController.index());

        return ok(views.html.system.lookupfilter.index.render(currentUser(), bc));
    }

    public Result create() {
    	
    	String path = getRefererPath();
        Http.MultipartFormData body = request().body().asMultipartFormData();
        Http.MultipartFormData.FilePart mappings = body.getFile("mappings");
        final String[] existingFieldArray = body.asFormUrlEncoded().get("existing-field");
        final String[] newFieldArray = body.asFormUrlEncoded().get("new-field");
        
        JsonObject obj = new JsonObject();
        String key = null;
        String value = null;
        if (existingFieldArray != null && newFieldArray != null) {
            key = existingFieldArray[0];
            value = newFieldArray[0];
            obj.addProperty("key", key);
            obj.addProperty("value", value);

            JsonParser parser = new JsonParser();
            boolean validJsonProvided = false;
            if (mappings != null) {
                try {                   
                    File file = mappings.getFile();
                    String mappingsContent = Files.toString(file, StandardCharsets.UTF_8);  

                    // create json element from json file          
                    JsonElement je = parser.parse(mappingsContent);
                    if (je.isJsonObject()) {
                        JsonArray mappingsArray = new JsonArray();
                        mappingsArray.add(je);
                        JsonElement jeArray = parser.parse(mappingsArray.toString());
                        obj.add("mappings", jeArray);
                        validJsonProvided = true;
                    }
                } catch(Exception e) {
                    Logger.warn("Exception while getting mappings from JSON file.", e);
                }
            }

            // create empty json element
            if (!validJsonProvided) {  
                Logger.info("Creating an empty mapping for < " + key + " > : < " + value + " > pair.");            
                JsonObject jo = new JsonObject();
                JsonElement je = parser.parse(jo.toString());
                JsonArray mappingsArray = new JsonArray();
                mappingsArray.add(je);
                JsonElement jeArray = parser.parse(mappingsArray.toString());
                obj.add("mappings", jeArray);
            }

            updateLookupMongoCollection(obj.toString(), key, value);

        }

        return redirect(path);

    }

    private static void updateLookupMongoCollection(String docStr, String key, String value) {

        Logger.info("Updating lookup collection for < " + key + " > : < " + value + " > pair.");

        MongoClient client = new MongoClient(mongoHost);
        MongoDatabase db = client.getDatabase(mongoDatabase);
        MongoCollection<Document> collection = db.getCollection(mongoCollection);

        Document document = Document.parse(docStr);
        if (collection.find(new Document("key", key).append("value", value)) != null) {
            collection.deleteOne(new Document("key", key).append("value", value));
        }
        collection.insertOne(document);

        client.close();

    }
    
}