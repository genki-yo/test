package com.example.simplealarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val alarmTime = intent?.getLongExtra(EXTRA_ALARM_TIME, 0L) ?: 0L
        val alertIntent = Intent(context, AlarmAlertActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra(EXTRA_ALARM_TIME, alarmTime)
        }
        context.startActivity(alertIntent)
    }

    companion object {
        const val REQUEST_CODE_ALARM = 1001
        const val EXTRA_ALARM_TIME = "com.example.simplealarm.EXTRA_ALARM_TIME"
    }
}
