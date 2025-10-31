package com.example.simplealarm

import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.simplealarm.databinding.ActivityAlarmAlertBinding
import java.text.DateFormat
import java.util.Date

class AlarmAlertActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAlarmAlertBinding
    private var ringtone: Ringtone? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAlarmAlertBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val alarmTime = intent.getLongExtra(AlarmReceiver.EXTRA_ALARM_TIME, 0L)
        if (alarmTime > 0) {
            val formatted = DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(alarmTime))
            binding.alarmTimeLabel.text = getString(R.string.alarm_time_label, formatted)
        }

        binding.dismissButton.setOnClickListener {
            stopRingtone()
            finish()
        }
    }

    override fun onStart() {
        super.onStart()
        startRingtone()
    }

    override fun onStop() {
        super.onStop()
        stopRingtone()
    }

    private fun startRingtone() {
        if (ringtone?.isPlaying == true) return
        val alarmUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ?: return
        ringtone = RingtoneManager.getRingtone(this, alarmUri)
        ringtone?.play()
    }

    private fun stopRingtone() {
        ringtone?.stop()
    }
}
