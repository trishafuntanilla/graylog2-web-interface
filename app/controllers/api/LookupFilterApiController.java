package controllers.api;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AuthenticatedController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import play.libs.Json;
import play.mvc.Result;

import javax.inject.Inject;
import org.bson.Document;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import lib.Global;

public class LookupFilterApiController extends AuthenticatedController {
    
    private static final Logger log = LoggerFactory.getLogger(LookupFilterApiController.class);

    private static final String mongoHost = Global.mongoHost;
    private static final String mongoDatabase = Global.mongoDatabase;
    private static final String mongoCollection = "lookup";
    
    @Inject
    public LookupFilterApiController() {
        
    }

    public Result load() {

    	log.debug("Inside load() method...");

    	JsonObject retval = new JsonObject();
    	final JsonArray filtersArray = new JsonArray();
    	final JsonParser parser = new JsonParser();

        MongoClient client = new MongoClient(mongoHost);
        MongoDatabase db = client.getDatabase(mongoDatabase);
        MongoCollection<Document> collection = db.getCollection(mongoCollection);

        FindIterable<Document> iterable = collection.find();
        if (iterable != null) {
			iterable.forEach(new Block<Document>() {
			    @Override
			    public void apply(final Document document) {

					JsonObject filterObj = (parser.parse(document.toJson())).getAsJsonObject();
					JsonObject filterDetails = new JsonObject();
					filterDetails.addProperty("key", filterObj.get("key").getAsString());
					filterDetails.addProperty("value", filterObj.get("value").getAsString());
                    JsonArray mappings = filterObj.get("mappings").getAsJsonArray();
                    JsonElement mappingsAsJE = parser.parse(mappings.toString());
                    filterDetails.add("mappings", mappingsAsJE);
					filtersArray.add(parser.parse(filterDetails.toString()));
			    
			    }
			
			});

			JsonElement allFilters = parser.parse(filtersArray.toString());
			retval.add("filters", allFilters);

			client.close();

			return ok(Json.toJson(retval.toString()));
		}

        client.close();

		return ok();

    }

    public Result delete() {

    	log.debug("Inside delete() method...");

    	final JsonNode json = request().body().asJson();
    	String key = json.get("filter").get("key").textValue();
    	String value = json.get("filter").get("value").textValue();

        MongoClient client = new MongoClient(mongoHost);
        MongoDatabase db = client.getDatabase(mongoDatabase);
        MongoCollection<Document> collection = db.getCollection(mongoCollection);

	    log.info("Deleting key: " + key + ", value: " + value);
	    collection.findOneAndDelete(new Document("key", key).append("value", value));

	    client.close();

        return ok();

    }
    
}