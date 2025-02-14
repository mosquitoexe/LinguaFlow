import React, { useState, useRef } from 'react';

function App() {
  const [frase, setFrase] = useState("");
  const [correcao, setCorrecao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedTenses, setSelectedTenses] = useState({});
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const userAnswerRef = useRef(null);
  const timerRef = useRef(null);

  const handleGeneratePhrase = async () => {
    const selectedTensesArray = Object.keys(selectedTenses).filter(key => selectedTenses[key]);

    if (selectedTensesArray.length === 0) {
      setError("Por favor, selecione ao menos um tempo verbal.");
      return;
    }

    let prompt = "Gere uma frase curta aleatória em inglês apenas com um verbo. Tempo verbal selecionado: ";
    prompt += selectedTensesArray.join(", ");

    try {
      setLoading(true);
      setError("");
      setTimeElapsed(0);
      clearInterval(timerRef.current);
      setIsTimerRunning(false); // Pausa o timer antes de gerar a frase

      const response = await fetch("http://localhost:1234/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar a frase.");
      }

      const data = await response.json();
      setFrase(data.choices[0]?.message?.content || "Resposta não encontrada.");

      // Inicia o cronômetro quando a frase for gerada
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      setIsTimerRunning(true);
    } catch (error) {
      console.error("Erro ao chamar a API:", error);
      setError("Erro ao gerar a frase. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = async () => {
    const userAnswer = userAnswerRef.current.value;
    if (!userAnswer.trim()) {
      setError("Por favor, insira uma frase para correção.");
      return;
    }

    const prompt = `Verifique se a frase "${userAnswer}" está correta. Se não estiver, forneça a correção.`;

    try {
      setLoading(true);
      setCorrecao("");
      setError("");

      const response = await fetch("http://localhost:1234/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar a frase.");
      }

      const data = await response.json();
      setCorrecao(data.choices[0]?.message?.content || "Sem correções.");
    } catch (error) {
      console.error("Erro ao corrigir a frase:", error);
      setError("Erro ao corrigir. Tente novamente.");
    } finally {
      setLoading(false);
      clearInterval(timerRef.current); // Para o cronômetro quando corrigir a frase
      setIsTimerRunning(false);
    }
  };

  const handleTenseChange = (event) => {
    const { name, checked } = event.target;
    setSelectedTenses((prevTenses) => ({
      ...prevTenses,
      [name]: checked,
    }));
  };

  return (
    <div
      style={{
        backgroundImage: `url('imagem.webp')`,
        backgroundColor: "#1a1a1a",
        color: "#f5a623",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "'Roboto', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          padding: "50px",
          borderRadius: "12px",
          maxWidth: "800px",
          width: "90%",
          animation: "fadeIn 1s ease-in-out, slideUp 1s ease-in-out",
        }}
      >
        <h1
          style={{
            color: "#ff7f11",
            textShadow: "0px 2px 5px rgba(255, 127, 17, 0.7)",
            fontSize: "36px",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          LinguaFlow
        </h1>

        <p
          style={{
            fontSize: "16px",
            textAlign: "justify",
            marginBottom: "20px",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          Este aplicativo gera frases aleatórias em inglês para você praticar conjugação verbal.
          Selecione os tempos verbais que deseja praticar e comece a treinar!
        </p>

        <div style={{ marginBottom: "20px" }}>
          {["Present Simple", "Present Continuous", "Present Perfect Simple", "Present Perfect Continuous", "Past Simple", "Past Continuous", "Past Perfect Simple", "Past Perfect Continuous", "Future Simple", "Future Continuous", "Future Perfect Simple", "Future Perfect Continuous"].map((tense) => (
            <label key={tense}>
              <input
                type="checkbox"
                name={tense}
                checked={selectedTenses[tense] || false}
                onChange={handleTenseChange}
                style={{ marginRight: "8px" }}
              />
              {tense}
              <br />
            </label>
          ))}
        </div>

        <label
          style={{
            fontSize: "18px",
            color: "#fff",
            marginBottom: "10px",
            display: "block",
          }}
        >
          Resposta:
        </label>
        <input
          ref={userAnswerRef}
          type="text"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: "#333",
            color: "#fff",
          }}
        />
        <br />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={handleGeneratePhrase}
            style={{
              backgroundColor: "#ff7f11",
              color: "#fff",
              padding: "15px 30px",
              fontSize: "18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Gerar Frase
          </button>

          <button
            onClick={handleCorrection}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "15px 30px",
              fontSize: "18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Corrigir Frase
          </button>
        </div>

        {loading && (
          <p style={{ color: "#ff7f11" }}>
            <span>🌀</span> Carregando...
          </p>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {frase && (
          <div
            style={{
              backgroundColor: "#444",
              padding: "15px",
              borderRadius: "8px",
              color: "#fff",
              marginTop: "20px",
            }}
          >
            <h3>Frase Gerada:</h3>
            <p>{frase}</p>
          </div>
        )}

        {correcao && (
          <div
            style={{
              backgroundColor: "#444",
              padding: "15px",
              borderRadius: "8px",
              color: "#fff",
              marginTop: "20px",
            }}
          >
            <h3>Correção:</h3>
            <p>{correcao}</p>
          </div>
        )}

        {timeElapsed > 0 && (
          <p
            style={{
              fontSize: "16px",
              color: "#fff",
              marginTop: "10px",
            }}
          >
            Tempo Decorrido: {timeElapsed} segundos
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
