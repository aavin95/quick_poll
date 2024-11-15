"use client";
import React, { useEffect, useState } from "react";
import {
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import styled from "styled-components";
import toast, { Toaster } from "react-hot-toast";
import { FaCog } from "react-icons/fa";

interface PollOption {
  name: string;
  value: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  names: string[];
}

interface AdvancedPreferences {
  requireNames: boolean;
  allowMultipleVotes: boolean;
  freeResponse: boolean;
}

// Container that centers its contents both horizontally and vertically
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  gap: 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1; // Allow card to grow and shrink
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  font-family: "Roboto", sans-serif;
`;

const Question = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  font-family: "Roboto", sans-serif;
`;

const Text = styled.p`
  font-size: 1em;
  color: #3666eb;
  margin-bottom: 1em;
  font-family: "Roboto", sans-serif;
  text-align: center;
`;

const VoteContainer = styled.div`
  width: 100%; // Changed to 100% for responsiveness
  max-width: 250px; // Set a max-width for larger screens
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  flex: 1; // Allow vote container to grow and shrink
`;

const VoteButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background-color: #3666eb;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #274bb5;
  }
`;

const FreeResponseInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  font-size: 16px;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #3666eb;
    outline: none;
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

const GraphOptionsCard = styled.div`
  width: 100%; // Changed to 100% for responsiveness
  max-width: 250px; // Set a max-width for larger screens
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const GraphOptionsContainer = styled.div`
  width: 100%; // Changed to 100% for responsiveness
  max-width: 200px; // Set a max-width for larger screens
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
`;

const GraphFeaturesContainer = styled.div`
  align-items: center;
`;

const GraphFeatureCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Space between checkbox and label
  color: #333333;
  font-size: 1em;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
`;
const ButtonContainer2 = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px; // Consistent spacing between buttons
  margin-top: 1em; // Adds space above buttons for uniform layout
`;
const UndoVoteButton = styled.button`
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

const ViewNamesButton = styled.button`
  display: flex;
  align-items: center;
  font-size: 1em;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
  color: #3666eb;
  margin-left: auto;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  font-size: 16px;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 10px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #3666eb;
    outline: none;
  }
`;

const NamesContainer = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
  max-width: 200px;

  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
    font-family: "Roboto", sans-serif;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    color: #666;
    font-family: "Roboto", sans-serif;

    &:last-child {
      border-bottom: none;
    }
  }
`;

export default function PollPage({ params }: { params: { pollID: string } }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { pollID } = params;
  const [pollData, setPollData] = useState<PollData>({
    question: "",
    options: [],
    names: [],
  });
  const [advancedPreferences, setAdvancedPreferences] =
    useState<AdvancedPreferences>({
      requireNames: false,
      allowMultipleVotes: false,
      freeResponse: false,
    });
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [freeResponse, setFreeResponse] = useState<string>("");
  const [graphType, setGraphType] = useState<string>("barGraph");
  const [showGraphOptions, setShowGraphOptions] = useState<boolean>(false);
  const [optionVotedName, setOptionVotedName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showNames, setShowNames] = useState<boolean>(false);

  useEffect(() => {
    const fetchPollData = async () => {
      const response = await fetch(`/api/poll?pollId=${pollID}`);
      const data = await response.json();
      if (response.ok) {
        const options = Object.entries(data.options).map(([name, value]) => ({
          name,
          value: Number(value),
        }));
        setPollData({
          question: data.question,
          options,
          names: data.names,
        });
        setAdvancedPreferences(data.advancedPreferences);
      } else {
        console.error(data.error);
      }
    };
    setHasVoted(localStorage.getItem(`hasVoted-${pollID}`) === "true");
    setOptionVotedName(localStorage.getItem(`optionVotedName-${pollID}`) || "");
    setHasMounted(true);
    fetchPollData();
  }, [pollID]);

  useEffect(() => {}, [pollData]); // Here to get rid of a linting error in the useEffect hook above

  const handleVote = async (optionName: string) => {
    const response = await fetch(`/api/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pollId: pollID, option: optionName, name }),
    });

    if (response.ok) {
      const updatedData = await response.json();
      setHasVoted(true);
      localStorage.setItem(`hasVoted-${pollID}`, "true");
      setOptionVotedName(optionName);
      localStorage.setItem(`optionVotedName-${pollID}`, optionName);
      const options = Object.entries(updatedData.options).map(
        ([name, value]) => ({
          name,
          value: Number(value),
        })
      );
      setPollData({
        question: updatedData.question,
        options,
        names: updatedData.names,
      });
    } else {
      console.error("Error voting:", await response.json());
    }
  };

  const handleUndoVote = async () => {
    if (advancedPreferences.allowMultipleVotes) {
      return;
    }
    const response = await fetch(`/api/undoVote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pollId: pollID,
        option: optionVotedName,
        name,
        isFreeResponse: advancedPreferences.freeResponse,
      }),
    });
    if (response.ok) {
      const updatedData = await response.json();
      if (!advancedPreferences.allowMultipleVotes) {
        setHasVoted(false);
      }
      localStorage.removeItem(`hasVoted-${pollID}`);

      const options = Object.entries(updatedData.options).map(
        ([name, value]) => ({
          name,
          value: Number(value),
        })
      );
      setPollData({
        question: updatedData.question,
        options,
        names: updatedData.names,
      });
    } else {
      console.error("Error undoing vote:", await response.json());
    }
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Toaster />
      <Container>
        {/* Voting Container on the left */}
        {(!hasVoted || advancedPreferences.allowMultipleVotes) && (
          <VoteContainer>
            <Title>Cast Your Vote</Title>
            {pollData && (
              <>
                {advancedPreferences.requireNames && (
                  <>
                    <Text>Please enter your name to vote.</Text>
                    <NameInput
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </>
                )}
                {!advancedPreferences.freeResponse &&
                  pollData.options.map((option) => (
                    <VoteButton
                      key={option.name}
                      onClick={() =>
                        toast.promise(handleVote(option.name), {
                          loading: "Submitting your vote...",
                          success: <b>Vote submitted!</b>,
                          error: <b>Could not submit your vote.</b>,
                        })
                      }
                    >
                      {option.name}
                    </VoteButton>
                  ))}
                {advancedPreferences.freeResponse && (
                  <div>
                    <FreeResponseInput
                      placeholder="Enter your response"
                      value={freeResponse}
                      onChange={(e) => setFreeResponse(e.target.value)}
                    />
                    <VoteButton onClick={() => handleVote(freeResponse)}>
                      Submit
                    </VoteButton>
                  </div>
                )}
              </>
            )}
          </VoteContainer>
        )}

        {/* Results Container on the right */}
        <Card>
          <Question>{pollData.question}</Question>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <Title>Results</Title>
              {pollData && pollData.options.length > 0 ? (
                <>
                  {graphType === "barGraph" && (
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={pollData.options}
                          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 12,
                              fill: "#666",
                              fontFamily: "Arial, sans-serif",
                              fontWeight: "bold",
                            }}
                          />
                          <YAxis
                            tick={{
                              fontSize: 12,
                              fill: "#666",
                              fontFamily: "Arial, sans-serif",
                              fontWeight: "bold",
                            }}
                          />
                          <Tooltip
                            cursor={false}
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #ddd",
                              borderRadius: 5,
                              fontFamily: "Arial, sans-serif",
                              color: "#000",
                              fontWeight: "bold",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            radius={[10, 10, 0, 0]}
                            fill="#3666eb"
                            onMouseEnter={(data, index) => {
                              const bar = document.querySelector(
                                `#bar-${index}`
                              );
                              if (bar) {
                                (bar as HTMLElement).style.filter =
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.2))";
                                (bar as HTMLElement).style.transform =
                                  "scaleY(1.02)";
                                (bar as HTMLElement).style.transformOrigin =
                                  "bottom";
                              }
                            }}
                            onMouseLeave={(data, index) => {
                              const bar = document.querySelector(
                                `#bar-${index}`
                              );
                              if (bar) {
                                (bar as HTMLElement).style.filter = "none";
                                (bar as HTMLElement).style.transform =
                                  "scaleY(1)";
                              }
                            }}
                          >
                            {pollData.options.map((entry, index) => {
                              const isHighest =
                                entry.value ===
                                Math.max(
                                  ...pollData.options.map((o) => o.value)
                                );
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  id={`bar-${index}`}
                                  fill={isHighest ? "#80aaff" : "#3666eb"}
                                  style={{
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    transformOrigin: "bottom",
                                  }}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {graphType === "pieChart" && (
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pollData.options}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#3666eb"
                            label
                          >
                            {pollData.options.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.value ===
                                  Math.max(
                                    ...pollData.options.map((o) => o.value)
                                  )
                                    ? "#80aaff"
                                    : "#3666eb"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #ddd",
                              borderRadius: 5,
                              fontFamily: "Arial, sans-serif",
                              color: "#000",
                              fontWeight: "bold",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {graphType === "donutChart" && (
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pollData.options}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            fill="#3666eb"
                            label
                          >
                            {pollData.options.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.value ===
                                  Math.max(
                                    ...pollData.options.map((o) => o.value)
                                  )
                                    ? "#80aaff"
                                    : "#3666eb"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #ddd",
                              borderRadius: 5,
                              fontFamily: "Arial, sans-serif",
                              color: "#000",
                              fontWeight: "bold",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <Text>No votes have been cast yet. Be the first to vote!</Text>
              )}
            </div>

            {advancedPreferences.requireNames && (
              <ViewNamesButton onClick={() => setShowNames(!showNames)}>
                {showNames ? "Hide Names" : "View Names"}
              </ViewNamesButton>
            )}
          </div>
          <div>
            <ButtonContainer2>
              {hasVoted && !advancedPreferences.allowMultipleVotes && (
                <UndoVoteButton onClick={handleUndoVote}>
                  Undo Vote
                </UndoVoteButton>
              )}
              <GearButton
                onClick={() => setShowGraphOptions(!showGraphOptions)}
              >
                <FaCog size={24} />
              </GearButton>
            </ButtonContainer2>
          </div>
        </Card>
        {showNames && pollData.names && pollData.names.length > 0 && (
          <NamesContainer>
            <h3>Participants ({pollData.names.length})</h3>
            <ul>
              {pollData.names.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </NamesContainer>
        )}
        {showGraphOptions && (
          <GraphOptionsCard>
            <Title>Options</Title>
            <Text>Customize your graph options here.</Text>

            <GraphOptionsContainer>
              <GraphFeaturesContainer>
                <Text>Graph Type</Text>
                <GraphFeatureCheckbox>
                  <input
                    type="checkbox"
                    id="barGraph"
                    checked={graphType === "barGraph"}
                    onChange={() => setGraphType("barGraph")}
                  />
                  <label htmlFor="barGraph">Bar Graph</label>
                </GraphFeatureCheckbox>
                <GraphFeatureCheckbox>
                  <input
                    type="checkbox"
                    id="pieChart"
                    checked={graphType === "pieChart"}
                    onChange={() => setGraphType("pieChart")}
                  />
                  <label htmlFor="pieChart">Pie Chart</label>
                </GraphFeatureCheckbox>
                <GraphFeatureCheckbox>
                  <input
                    type="checkbox"
                    id="donutChart"
                    checked={graphType === "donutChart"}
                    onChange={() => setGraphType("donutChart")}
                  />
                  <label htmlFor="donutChart">Donut Chart</label>
                </GraphFeatureCheckbox>
              </GraphFeaturesContainer>
            </GraphOptionsContainer>
          </GraphOptionsCard>
        )}
      </Container>
    </>
  );
}
