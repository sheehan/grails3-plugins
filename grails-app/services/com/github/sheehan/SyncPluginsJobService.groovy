package com.github.sheehan

import com.agileorbit.schwartz.SchwartzJob
import grails.util.Environment
import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import org.quartz.JobExecutionContext
import org.quartz.JobExecutionException

@CompileStatic
@Slf4j
class SyncPluginsJobService implements SchwartzJob {

	PluginService pluginService
	TwitterService twitterService

	void execute(JobExecutionContext context) throws JobExecutionException {
		log.info 'Fetching latest plugin data'

		Compare compare = pluginService.refreshPlugins()
		if (compare) {
			compare.newVersions.each { Compare.NewVersion newVersion ->
				String name = newVersion.plugin.name
				String version = newVersion.version
				twitterService.tweet "$name $version released: https://grails.org/plugin/$name"
			}
		}

		log.info 'Plugin data updated'
	}

	void buildTriggers() {
		if (!Environment.developmentMode) {
			triggers << factory('repeat every hour').intervalInHours(1).build()
		}
	}
}
