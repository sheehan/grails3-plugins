package com.github.sheehan

class Plugins {

    private static List<Map> plugins = []

    static List<Map> get() {
        plugins
    }

    static void set(List<Map> plugins) {
        this.plugins = plugins
    }

}
