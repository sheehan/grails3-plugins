@Grab('org.twitter4j:twitter4j-core:4.0.4')

import groovy.json.JsonSlurper
import twitter4j.conf.ConfigurationBuilder
import twitter4j.Twitter
import twitter4j.TwitterFactory

class Compare {

    static String TWITTER_CONSUMER_KEY = System.getenv('TWITTER_CONSUMER_KEY')
    static String TWITTER_CONSUMER_KEY_SECRET = System.getenv('TWITTER_CONSUMER_KEY_SECRET')
    static String TWITTER_ACCESS_TOKEN = System.getenv('TWITTER_ACCESS_TOKEN')
    static String TWITTER_ACCESS_TOKEN_SECRET = System.getenv('TWITTER_ACCESS_TOKEN_SECRET')

    static void main(String[] args) {
        def oldJson = new JsonSlurper().parseText(new File(args[0]).text)
        def newJson = new JsonSlurper().parseText(new File(args[1]).text)
        new Compare().compare(oldJson, newJson)
    }

    final Twitter twitter

    Compare() {
        ConfigurationBuilder cb = new ConfigurationBuilder()
        cb.setDebugEnabled(true)
            .setOAuthConsumerKey(TWITTER_CONSUMER_KEY)
            .setOAuthConsumerSecret(TWITTER_CONSUMER_KEY_SECRET)
            .setOAuthAccessToken(TWITTER_ACCESS_TOKEN)
            .setOAuthAccessTokenSecret(TWITTER_ACCESS_TOKEN_SECRET)
        TwitterFactory tf = new TwitterFactory(cb.build())
        this.twitter = tf.getInstance()
    }

    void compare(oldJson, newJson) {
        newJson.each { plugin ->
            Map match = oldJson.find { it.name == plugin.name }
            if (!match && plugin.latest_version) {
                tweet "$plugin.name $plugin.latest_version released: https://grails.org/plugins.html#plugin/$plugin.name"
                return
            }

            if (plugin.latest_version_created != match.latest_version_created) {
                List versions = plugin.versions - match.versions
                if (versions) {
                    versions.reverse().each { String version ->
                        tweet "$plugin.name $version released: https://grails.org/plugins.html#plugin/$plugin.name"
                    }
                }
            }
        }
    }

    void tweet(String status) {
        try {
            println "tweeting: $status"
            twitter.updateStatus status
        } catch (e) {
            println "failed to tweet '${status}'"
            e.printStackTrace()
        }
    }
}