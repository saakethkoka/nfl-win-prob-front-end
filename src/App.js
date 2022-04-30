import './App.css';
import React, {Fragment, useState} from "react";
import {Button, Chip, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography} from "@mui/material";
import axios from "axios";


const baseurl = "https://sas4nzx8f6.execute-api.us-east-2.amazonaws.com/Default/"


export default function App() {
    const [homeScore, setHomeScore] = useState(NaN);
    const [awayScore, setAwayScore] = useState(NaN);
    const [quarter, setQuarter] = useState(null);
    const [minute, setMinute] = useState(NaN);
    const [second, setSecond] = useState(NaN);

    const [homeError, setHomeError] = useState(false);
    const [awayError, setAwayError] = useState(false);
    const [quarterError, setQuarterError] = useState(false);
    const [minutesError, setMinutesError] = useState(false);
    const [secondsError, setSecondsError] = useState(false);


    const [probability, setProbability] = useState(NaN);

    const [homeProbColor, setHomeProbColor] = useState("primary");
    const [awayProbColor, setAwayProbColor] = useState("primary");


    const getProbability = (score_diff, time_left) => new Promise((resolve, reject) => {
        axios.get( `${baseurl}/winprob?score_diff=${score_diff}&time_left=${time_left}`).then(res => {
            resolve(res.data);
        }).catch(err => reject(err));
    });





    const handleSubmit = () => {
        setHomeError(false);
        setAwayError(false);
        setQuarterError(false);
        setMinutesError(false);
        setSecondsError(false);

        isNaN(homeScore) && setHomeError(true);
        isNaN(awayScore) && setAwayError(true);
        !quarter && setQuarterError(true);
        isNaN(minute) && setMinutesError(true);
        isNaN(second) && setSecondsError(true);

        homeScore < 0 && setHomeError(true);
        awayScore < 0 && setAwayError(true);
        (minute < 0 || minute > 15) && setMinutesError(true);
        (second < 0 || second > 59) && setSecondsError(true);
        (minute === 15 && second > 0) && setSecondsError(true);
        (minute === 15 && second > 0) && setMinutesError(true);

        if (homeError || awayError || quarterError || minutesError || secondsError) {
            return;
        }

        let time_left = 0;
        if(quarter === 5){
            time_left = minute * 60 + second;
        }
        else{
            time_left = minute * 60 + second;
            time_left += 15 * 60 * (4 - quarter);
        }

        let scorre_diff = homeScore - awayScore;


        getProbability(scorre_diff, time_left).then(res => {
            if (res < .5){
                setHomeProbColor("success");
                setAwayProbColor("error");
            }
            else{
                setHomeProbColor("error");
                setAwayProbColor("success");
            }
            setProbability(res);
        });

    }


    const handleReset = () => {
      setHomeScore(NaN);
      setAwayScore(NaN);
      setQuarter(null);
      setMinute(NaN);
      setSecond(NaN);
      setProbability(NaN);
    }


    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '100vh' }}
        >
            <Paper elevation="24" style={{ padding: 50 }}>
                <h1>NFL Win Probability</h1>
                <Grid>
                    <TextField
                        onChange={event => setHomeScore(parseInt(event.target.value))}
                        value={homeScore}
                        type="number"
                        sx={{ width: "50%" }}
                        error={homeError}
                        min={0}
                        label={"Home Team Score"}/>
                    <TextField
                        onChange={event => setAwayScore(parseInt(event.target.value))}
                        value={awayScore}
                        error={awayError}
                        sx={{ width: "50%" }}
                        type="number"
                        label={"Away Team Score"}
                    />
                </Grid>
                <Grid sx={{"margin-top": 10}}>
                    <InputLabel id="demo-simple-select-label">Quarter</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={quarter}
                        error={quarterError}
                        label="Quarter"
                        onChange={event => setQuarter(parseInt(event.target.value))}
                    >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>OT</MenuItem>
                    </Select>

                    <TextField
                        onChange={event => setMinute(parseInt(event.target.value))}
                        value={minute}
                        error={minutesError}
                        type="number"
                        label={"Min"}
                    />
                    <TextField
                        onChange={event => setSecond(parseInt(event.target.value))}
                        value={second}
                        error={secondsError}
                        type="number"
                        label={"Sec"}
                    />
                </Grid>

                <Grid sx={{"margin-top" : 10}}>
                    <Button sx={{width:"(50% - 12%)", "margin-right": 10}} variant="contained" onClick={handleSubmit}>Submit</Button>
                    <Button sx={{width:"(50% - 12%)"}} variant="outlined" onClick={handleReset}>Reset</Button>
                </Grid>
                <Grid container sx={{"margin-top" : 20}}>
                    <Grid item sm={10}>
                        {!isNaN(probability) &&
                            <Fragment>
                                <Typography sx={{"margin-left": 5}}>Home</Typography>
                                <Chip
                                    label={(1 - probability).toFixed(3)}
                                    color={homeProbColor}
                                />
                            </Fragment>
                        }
                    </Grid>
                    <Grid item>
                        {!isNaN(probability) &&
                            <Fragment>
                                <Typography sx={{"margin-left": 5}}>Away</Typography>
                                <Chip
                                    label={(probability).toFixed(3)}
                                    color={awayProbColor}
                                />
                            </Fragment>
                        }
                    </Grid>

                </Grid>
            </Paper>
        </Grid>

    );
}