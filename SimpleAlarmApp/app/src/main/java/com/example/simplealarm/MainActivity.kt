package com.example.simplealarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.AlarmManagerCompat
import com.example.simplealarm.databinding.ActivityMainBinding
import java.text.DateFormat
import java.util.Calendar

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.timePicker.setIs24HourView(true)
        updateNextAlarmText(null)

        binding.setAlarmButton.setOnClickListener {
            val calendar = Calendar.getInstance().apply {
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                set(Calendar.HOUR_OF_DAY, binding.timePicker.hour)
                set(Calendar.MINUTE, binding.timePicker.minute)
            }

            val now = Calendar.getInstance()
            if (calendar.before(now)) {
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            scheduleAlarm(calendar.timeInMillis)
            updateNextAlarmText(calendar)
            Toast.makeText(this, R.string.alarm_set_confirmation, Toast.LENGTH_SHORT).show()
        }
    }

    private fun scheduleAlarm(triggerAtMillis: Long) {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, AlarmReceiver::class.java).apply {
            putExtra(AlarmReceiver.EXTRA_ALARM_TIME, triggerAtMillis)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            AlarmReceiver.REQUEST_CODE_ALARM,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        AlarmManagerCompat.setExactAndAllowWhileIdle(
            alarmManager,
            AlarmManager.RTC_WAKEUP,
            triggerAtMillis,
            pendingIntent
        )
    }

    private fun updateNextAlarmText(calendar: Calendar?) {
        val message = if (calendar == null) {
            getString(R.string.no_alarm_set)
        } else {
            val formatted = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT)
                .format(calendar.time)
            getString(R.string.next_alarm_template, formatted)
        }
        binding.nextAlarmText.text = message
    }
}
