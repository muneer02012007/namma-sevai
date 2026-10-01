import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);

  const askAI = async (text) => {
    if (!text.trim()) return;

    setMessage(text);
    setReply("");
    setCurrentStep(1);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.reply) {
        setReply(data.reply);
      } else {
        throw new Error("No reply");
      }
    } catch {
      setReply(
        "வருமானச் சான்றிதழ் பெறுவதற்கு நான் உங்களுக்கு படிப்படியாக உதவுகிறேன்.\n\n1. உங்கள் மாவட்டத்தை தேர்வு செய்யுங்கள்.\n2. வருமானச் சான்றிதழ் சேவையை தேர்வு செய்யுங்கள்.\n3. கேட்கப்படும் விவரங்களை நிரப்புங்கள்.\n4. தேவையான ஆவணங்களை சமர்ப்பிக்கவும்.\n\nதற்போதைய விதிமுறைகளை அதிகாரப்பூர்வ இணையதளத்தில் சரிபார்க்கவும்."
      );
    }

    setLoading(false);
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Chrome browser-ல் voice input பயன்படுத்தவும்.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "ta-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage("");
      setReply("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        askAI(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const nextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, 4));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">உ</div>

          <div>
            <h2>Namma Sevai</h2>
            <span>AI Government Guide</span>
          </div>
        </div>

        <div className="language">தமிழ்</div>
      </header>

      <main className="hero">
        <div className="welcome-badge">
          ✨ AI-powered • Tamil-first
        </div>

        <h1>
          அரசு சேவைகளை
          <br />
          <span>எளிதாக அணுகுங்கள்</span>
        </h1>

        <p className="subtitle">
          உங்கள் மொழியில் கேளுங்கள்.
          <br />
          நாங்கள் ஒவ்வொரு படியாகவும் வழிகாட்டுகிறோம்.
        </p>

        <div className="voice-card">

          {/* MICROPHONE */}

          <button
            className={`mic-circle ${
              isListening ? "mic-listening" : ""
            }`}
            onClick={startVoice}
            disabled={loading}
          >
            {isListening ? "🔴" : "🎙️"}
          </button>

          <div className="voice-status">
            {isListening ? (
              <>
                <div className="sound-bars">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <h2>கேட்டுக்கொண்டிருக்கிறோம்...</h2>

                <p>இப்போது பேசுங்கள்</p>
              </>
            ) : loading ? (
              <>
                <div className="ai-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <h2>AI பதிலை தயாரிக்கிறது...</h2>

                <p>ஒரு கணம் காத்திருக்கவும்</p>
              </>
            ) : (
              <>
                <h2>உங்களுக்கு என்ன உதவி வேண்டும்?</h2>

                <p>
                  பேசலாம் அல்லது கீழே உங்கள் கேள்வியை எழுதலாம்
                </p>
              </>
            )}
          </div>

          {/* TEXT INPUT */}

          <div className="input-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  askAI(message);
                }
              }}
              disabled={isListening || loading}
              placeholder="உதாரணம்: எனக்கு வருமானச் சான்றிதழ் வேண்டும்"
            />

            <button
              className="send-button"
              onClick={() => askAI(message)}
              disabled={isListening || loading}
            >
              →
            </button>
          </div>

          <button
            className="start-button"
            onClick={startVoice}
            disabled={isListening || loading}
          >
            {isListening
              ? "🔴 கேட்கிறது..."
              : loading
              ? "🤖 தயாராகிறது..."
              : "🎙️ குரலில் கேளுங்கள்"}
          </button>
        </div>

        {/* EXAMPLES */}

        {!reply && !loading && !isListening && (
          <div className="examples">
            <p>அல்லது ஒரு கேள்வியை தேர்வு செய்யுங்கள்</p>

            <div className="example-list">
              <button
                onClick={() =>
                  askAI("எனக்கு வருமானச் சான்றிதழ் வேண்டும்")
                }
              >
                📄 வருமானச் சான்றிதழ்
              </button>

              <button
                onClick={() =>
                  askAI("அரசு உதவி திட்டங்கள் என்ன?")
                }
              >
                🏛️ அரசு உதவி திட்டங்கள்
              </button>

              <button
                onClick={() =>
                  askAI("எப்படி விண்ணப்பிப்பது?")
                }
              >
                📝 எப்படி விண்ணப்பிப்பது?
              </button>
            </div>
          </div>
        )}

        {/* ANSWER */}

        {reply && !loading && (
          <div className="answer-card">

            <div className="answer-title">
              🤖 Namma Sevai
            </div>

            <div className="progress">
              <div className="progress-top">
                <span>உங்கள் வழிகாட்டி</span>
                <strong>
                  படி {currentStep} / 4
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${currentStep * 25}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="user-question">
              நீங்கள் கேட்டது: {message}
            </div>

            <div className="step-label">
              <span>0{currentStep}</span>

              {currentStep === 1 && "முதல் படி"}
              {currentStep === 2 && "இரண்டாம் படி"}
              {currentStep === 3 && "மூன்றாம் படி"}
              {currentStep === 4 && "நான்காம் படி"}
            </div>

            <div className="answer">
              {reply.split("\n").map((line, index) => (
                <div key={index}>
                  {line || <br />}
                </div>
              ))}
            </div>

            <button
              className="next-step"
              onClick={nextStep}
              disabled={currentStep === 4}
            >
              {currentStep === 4
                ? "✓ வழிகாட்டுதல் முடிந்தது"
                : "அடுத்த படி →"}
            </button>

            <a
              href="https://www.tnesevai.tn.gov.in/citizen/"
              target="_blank"
              rel="noreferrer"
              className="official-button"
            >
              அதிகாரப்பூர்வ இணையதளத்தை திறக்கவும் →
            </a>
          </div>
        )}
      </main>

      <footer>
        <span>Designed for first-time digital users</span>
        <span>•</span>
        <span>Simple. Local. Accessible.</span>
      </footer>
    </div>
  );
}

export default App;