"use client";
import { useState, useEffect } from "react";
import styled from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaCog, FaTimes } from "react-icons/fa"; // Import gear icon from react-icons

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2em 1em; // Responsive padding for smaller screens
  gap: 20px; // Add gap between cards
`;

const Text = styled.p`
  font-size: 1em;
  color: #3666eb;
  margin-bottom: 1em;
  font-family: "Roboto", sans-serif;
  text-align: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 90%; // Takes up most of the width on small screens
  padding: 2em; // Added padding to the card
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (min-width: 600px) {
    max-width: 400px; // Fixed max-width on larger screens
  }
`;

const Title = styled.h1`
  font-size: 1.5em;
  font-weight: bold;
  color: #333333;
  margin-bottom: 1.5em; // Consistent margin
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1em;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75em 1em;
  border-radius: 10px;
  border: 1px solid #e0e6ed;
  background-color: #f7f9fc;
  font-size: 1em;
  color: #333333;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #ffffff;
  }
`;

const DeleteButton = styled.button`
  padding: 0.5em;
  background-color: #ea666a;
  color: white;
  border: none;
  height: 1.25em;
  width: 1.25em;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;

  &:hover {
    background-color: #ff4d4d;
  }
`;

const ButtonContainer1 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; // Consistent spacing between buttons
  margin-top: 1em; // Adds space above buttons for uniform layout
`;

const ButtonContainer2 = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px; // Consistent spacing between buttons
  margin-top: 1em; // Adds space above buttons for uniform layout
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75em 1em;
  background-color: #667eea;
  color: #ffffff;
  font-size: 1em;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 0.5em; // Ensures consistent spacing at the bottom

  &:hover {
    background-color: #5a67d8;
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1; // Allows the button to grow and fill available space
  max-width: 80px; // Sets a maximum width for the button
  height: 40px;
  background-color: #ea666a;
  color: #ffffff;
  font-size: 1em;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff4d4d;
  }
`;

const GearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: auto; // Aligns gear button to the right

  &:hover {
    background-color: #e0e0e0;
  }
`;

const AdvancedContainer = styled.div`
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  gap: 10px; // Consistent spacing between buttons
  margin-top: 1em; // Adds space above buttons for uniform layout
`;

const AdvancedContainerTitle = styled.h1`
  font-size: 1.5em;
  font-weight: bold;
  color: #333333;
`;

const AdvancedFeaturesContainer = styled.div`
  align-items: center;
`;

const FeatureCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Space between checkbox and label
  color: #333333;
  font-size: 1em;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
`;

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [question, setQuestion] = useState("");
  const [optionFields, setOptionFields] = useState<string[]>(["", ""]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPostCreationOptions, setShowPostCreationOptions] = useState(false);
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const router = useRouter();
  const [advancedPreferences, setAdvancedPreferences] = useState({
    requireNames: false,
    allowMultipleVotes: false,
    freeResponse: false,
  });

  useEffect(() => {
    setHasMounted(true);
    const storedPollId = localStorage.getItem("pollId");
    if (storedPollId) {
      setCreatedPollId(storedPollId);
      setShowPostCreationOptions(true);
    }
  }, []);

  useEffect(() => {
    if (optionFields.length < 1) {
      setShowAdvanced(true);
      setAdvancedPreferences({
        requireNames: false,
        allowMultipleVotes: false,
        freeResponse: true,
      });
    }
  }, [optionFields]);

  const addOptionField = () => {
    setOptionFields([...optionFields, ""]);
  };

  const deleteOptionField = (index: number) => {
    setOptionFields(optionFields.filter((_, i) => i !== index));
  };

  const createPoll = async () => {
    const options = new Map<string, number>();
    optionFields.forEach((option) => {
      if (option) {
        options.set(option, 0);
      }
    });
    const response = await fetch("/api/poll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options: Object.fromEntries(options),
        advancedPreferences,
        names: [],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setShowPostCreationOptions(true);
      setCreatedPollId(data.pollId);
      localStorage.setItem("pollId", data.pollId);
    } else {
      const errorMessage = data.error || "An unknown error occurred";
      toast.error(`Error creating poll: ${errorMessage}`);
    }
  };

  const resetPoll = () => {
    setQuestion("");
    setOptionFields(["", ""]);
    setShowPostCreationOptions(false);
    setCreatedPollId(null);
    setAdvancedPreferences({
      requireNames: false,
      allowMultipleVotes: false,
      freeResponse: false,
    });
    localStorage.removeItem("pollId");
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Toaster />
      <Container>
        <Card>
          {showPostCreationOptions ? (
            <div>
              <Text>Poll created! What would you like to do next?</Text>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`/poll/${createdPollId}`);
                  toast.success("📎 Poll link copied to clipboard!");
                }}
              >
                Share Poll: Click to Copy Link
              </Button>
              <Button
                onClick={() => {
                  router.push(`/poll/${createdPollId}`);
                }}
              >
                Vote and View Poll
              </Button>
              <Button
                onClick={() => {
                  setQuestion("");
                  setOptionFields(["", ""]);
                  setShowPostCreationOptions(false);
                  setCreatedPollId(null);
                  localStorage.removeItem("pollId");
                }}
              >
                Create New Poll
              </Button>
            </div>
          ) : (
            <>
              <Title>Create a New Poll</Title>
              <InputContainer>
                <Input
                  type="text"
                  placeholder="Question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </InputContainer>

              {optionFields.map((option, index) => (
                <InputContainer key={index}>
                  <Input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newFields = [...optionFields];
                      newFields[index] = e.target.value;
                      setOptionFields(newFields);
                    }}
                  />
                  <DeleteButton onClick={() => deleteOptionField(index)}>
                    <FaTimes />
                  </DeleteButton>
                </InputContainer>
              ))}
              <ButtonContainer1>
                <Button onClick={addOptionField}>Add Option</Button>
                <Button onClick={createPoll}>Create Poll</Button>
                <ButtonContainer2>
                  <ResetButton onClick={resetPoll}>Clear</ResetButton>
                  <GearButton onClick={() => setShowAdvanced(!showAdvanced)}>
                    <FaCog size={24} />
                  </GearButton>
                </ButtonContainer2>
              </ButtonContainer1>
            </>
          )}
        </Card>

        {showAdvanced && (
          <Card>
            <AdvancedContainer>
              <AdvancedContainerTitle>Advanced Features</AdvancedContainerTitle>
              <Text>Customize your poll with advanced settings here.</Text>
              <AdvancedFeaturesContainer>
                <FeatureCheckbox>
                  <input
                    type="checkbox"
                    id="feature1"
                    checked={advancedPreferences.requireNames}
                    onChange={() =>
                      setAdvancedPreferences((prev) => ({
                        ...prev,
                        requireNames: !prev.requireNames,
                      }))
                    }
                  />
                  <label htmlFor="feature1">Require Names</label>
                </FeatureCheckbox>
                <FeatureCheckbox>
                  <input
                    type="checkbox"
                    id="feature2"
                    checked={advancedPreferences.allowMultipleVotes}
                    onChange={() =>
                      setAdvancedPreferences((prev) => ({
                        ...prev,
                        allowMultipleVotes: !prev.allowMultipleVotes,
                      }))
                    }
                  />
                  <label htmlFor="feature2">Allow Multiple Votes</label>
                </FeatureCheckbox>
                <FeatureCheckbox>
                  <input
                    type="checkbox"
                    id="feature3"
                    checked={advancedPreferences.freeResponse}
                    onChange={() =>
                      setAdvancedPreferences((prev) => ({
                        ...prev,
                        freeResponse: !prev.freeResponse,
                      }))
                    }
                  />
                  <label htmlFor="feature3">Free Response</label>
                </FeatureCheckbox>
              </AdvancedFeaturesContainer>
            </AdvancedContainer>
          </Card>
        )}
      </Container>
    </>
  );
}
