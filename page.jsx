import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function SchedulingConfigurator() {
  const [meetingTypes, setMeetingTypes] = useState([
    { name: "Inspection", duration: 30, triggerWords: "inspect, inspection", notes: "Basic walk-through" },
    { name: "Repair", duration: 60, triggerWords: "fix, broken, leak", notes: "May require tools on-site" },
  ]);

  const [previewInput, setPreviewInput] = useState("");
  const [previewResponse, setPreviewResponse] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("default");
  const [config, setConfig] = useState({});

  const voiceProfileMap = {
    default: {
      label: "Default (Balanced) - David",
      elevenLabsVoiceId: "elevenlabs_david_balanced"
    },
    empathetic: {
      label: "Empathetic - Nora",
      elevenLabsVoiceId: "elevenlabs_nora_empathetic"
    },
    energetic: {
      label: "Energetic - Alex",
      elevenLabsVoiceId: "elevenlabs_alex_energetic"
    },
    authoritative: {
      label: "Authoritative - Walter",
      elevenLabsVoiceId: "elevenlabs_walter_authoritative"
    },
  };

  const addMeetingType = () => {
    setMeetingTypes([...meetingTypes, { name: "", duration: 15, triggerWords: "", notes: "" }]);
  };

  const handlePreview = async () => {
    const input = previewInput.toLowerCase();
    const match = meetingTypes.find((type) =>
      type.triggerWords.split(",").some((word) => input.includes(word.trim().toLowerCase()))
    );

    const profile = voiceProfileMap[voiceStyle].label;
    const voiceId = voiceProfileMap[voiceStyle].elevenLabsVoiceId;

    let responseText = "";

    if (match) {
      responseText = `(${profile}) Great! Sounds like you need a ${match.name}. I’ll get that scheduled for ${match.duration} minutes. ${match.notes ? 'Note: ' + match.notes : ''}`;
    } else {
      responseText = `(${profile}) Hmm, I’m not sure what type of appointment that is. Could you give me a bit more detail?`;
    }

    setPreviewResponse(responseText);

    // Text-to-Speech playback with ElevenLabs
    const apiKey = "YOUR_ELEVENLABS_API_KEY";
    const voiceUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(voiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: responseText,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const exportConfig = () => {
    const newConfig = {
      meetingTypes,
      voiceStyle,
      voiceProfile: voiceProfileMap[voiceStyle].elevenLabsVoiceId,
    };
    setConfig(newConfig);

    const blob = new Blob([JSON.stringify(newConfig, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ai-scheduling-config.json";
    link.click();
  };

  useEffect(() => {
    if (Object.keys(config).length > 0) {
      console.log("Parsed & Applied Config in Real-Time:", config);
    }
  }, [config]);

  return (
    <div className="grid gap-6 p-6">
      <h2 className="text-xl font-bold">AI Scheduling Assistant Configurator</h2>
      {/* UI layout omitted for brevity */}
    </div>
  );
}