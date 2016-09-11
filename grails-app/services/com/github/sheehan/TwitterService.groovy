package com.github.sheehan

import grails.config.Config
import grails.core.support.GrailsConfigurationAware
import twitter4j.Twitter
import twitter4j.TwitterFactory
import twitter4j.conf.ConfigurationBuilder

class TwitterService implements GrailsConfigurationAware {

    private Twitter twitter

    void tweet(String status) {
        try {
            println "tweeting: $status"
            twitter.updateStatus status
        } catch (e) {
            println "failed to tweet '${status}'"
            e.printStackTrace()
        }
    }

    @Override
    void setConfiguration(Config config) {
        ConfigurationBuilder cb = new ConfigurationBuilder()
            .setDebugEnabled(true)
            .setOAuthConsumerKey(config.twitter.consumerKey)
            .setOAuthConsumerSecret(config.twitter.consumerSecret)
            .setOAuthAccessToken(config.twitter.accessToken)
            .setOAuthAccessTokenSecret(config.twitter.accessTokenSecret)
        TwitterFactory tf = new TwitterFactory(cb.build())
        this.twitter = tf.getInstance()
    }
}
