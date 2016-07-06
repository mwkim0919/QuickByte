# Group_22_QuickByte

##### Plugins
`cordova plugin add cordova-plugin-geolocation`

`cordova plugin add cordova-plugin-whitelist`

`cordova plugin add https://github.com/Rohfosho/CordovaCallNumberPlugin.git`

`cordova plugin add cordova-plugin-camera`

`cordova plugin add phonegap-facebook-plugin --variable APP_ID="bJq93xMNW7k0Bq8BJ8PPdL2VLkEXRQmZENQS6VRH" --variable APP_NAME="QuickByte"`

`cordova plugin add https://github.com/manishiitg/parse-push-plugin`

* In plugins/phonegap-Facebook-plugin/plugin.xml in line 60, replace..

`<!--  <framework src="platforms/android/FacebookLib" custom="true" /> -->`

`<framework src="com.android.support:support-v4:+" />`

`<framework src="com.facebook.android:facebook-android-sdk:3.23.0" />`
* Comment out `PushService.setDefaultPushCallback(this, MainActivity.class);`
* Don't put parse.1.8.0.jar

##### Android
* In AndroidManifest.xml,

`<uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" />`

* In config.xml,

`<feature name="Geolocation">`

    `<param name="android-package" value="org.apache.cordova.geolocation.GeoBroker" />`
    
`</feature>`


