import React from "react";
import './App.css';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.inputName = React.createRef();
        this.finalScore = 0;
        this.state = {
            error: null,
            isLoaded: false,
            question: {},
            gameOver: false,
            showSave: false,
            scoreSaved: false,
            scores: []
        };
    }

    restart() {
        console.log("restart");
        this.setState({
            error: null,
            isLoaded: false,
            question: {},
            gameOver: false,
            scoreSaved: false,
        });
        this.state.question.gameid = "";
        this.refreshData();
    }

    refreshData() {
        fetch("/.netlify/functions/parsetweets");
        let gameid = ""
        if (this.state && this.state.question.gameid)
            gameid = this.state.question.gameid;
        fetch("/.netlify/functions/getquestion?gameid=" + gameid)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        gameOver: false,
                        question: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {
        this.refreshData();
    }

    loadLeaderBoard() {
        fetch("/.netlify/functions/leaderboard")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        scores: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    play(answer) {
        let q = this.state.question
        let body = {}
        body.answer = answer
        body.id = q.id
        body.gameid = q.gameid
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        };
        console.log(requestOptions);
        this.setState({
            isLoaded: false,
        });
        fetch('/.netlify/functions/play', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.correct) {
                    this.refreshData();
                }
                else {
                    this.loadLeaderBoard();
                    this.finalScore = data.score
                    this.setState({
                        isLoaded: true,
                        gameOver: true,
                    });
                }
            });
    }

    saveScore() {
        this.setState({
            showSave: true,
        });
    }

    handleSubmit(event) {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"name": this.inputName.current.value, "gameid": this.state.question.gameid})
        };
        console.log(requestOptions);
        fetch('/.netlify/functions/savescore', requestOptions)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    scoreSaved: true,
                    showSave: false,
                    gameOver: true
                });
                this.loadLeaderBoard();
            });
        event.preventDefault();
    }

    render() {
        const {error, gameOver, isLoaded, question, showSave, scoreSaved, scores} = this.state;
        var leaderboard = ( <div className="col leaderBoardDiv">
            <b>Leader Board</b>
            <table className={"leaderBoardTable"}>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {scores.map((score, ind) => (
                    <tr key={ind}>
                        <td>{ind + 1}</td>
                        <td>{score.name}</td>
                        <td>{score.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>);

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div className="container gamediv">
                <div>
                    <img src="./load.gif" alt={"loader"} className={"loader"}/>
                </div>
            </div>
        } else if (showSave) {
            return <div className="container gamediv">
                <div className="row">
                    <div className="col">
                        <div className="questionText">Game Over</div>
                        <div className="tweet"><b>Your Score:</b> {this.finalScore} </div>
                        <form onSubmit={this.handleSubmit}>
                            <div className="row formrow">
                                <div className="col-2">
                                    Name:
                                </div>
                                <div className="col-10">
                                    <input type="text" ref={this.inputName}/>
                                </div>
                            </div>
                            <br/>
                            <input type="submit" value="Save" className="btn btn-primary"/>
                        </form>
                        <br/>
                        <br/>
                    </div>
                    {leaderboard}
                </div>
            </div>
        } else if (gameOver) {
            var saveButton;
            if (scoreSaved) {
                saveButton = <em>Score Saved!</em>;
            } else {
                saveButton = (
                    <button onClick={e => this.saveScore()} type="button" className="btn btn-primary">Save Your
                        Score</button>);
            }

            return <div className="container gamediv">
                <div className="row">
                    <div className="col">
                        <div className="questionText">Game Over</div>
                        <div className="tweet"><b>Your Score:</b> {this.finalScore} </div>
                        <button onClick={e => this.restart()} type="button" className="btn btn-primary">Try Again
                        </button>
                        {saveButton}
                    </div>
                    {leaderboard}
                </div>
            </div>
        } else {
            return (
                <div className="container gamediv">
                    <div className="row float-right scorediv">
                        <b>Score:</b> &nbsp; {question.score}
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="questionText"> Who said that?</div>
                            <div className="tweet">“ {question.tweet} ”</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 optionDiv" onClick={e => this.play(question.options[0].author)}>
                            <img src={question.options[0].pic} className="authorPic rounded" alt="author"/>
                            <span className="optionText">{question.options[0].name} </span>
                        </div>
                        <div className="col-4 optionDiv" onClick={e => this.play(question.options[1].author)}>
                            <img src={question.options[1].pic} className="authorPic rounded" alt="author"/>
                            <span className="optionText">{question.options[1].name} </span>
                        </div>
                        <div className="col-4 optionDiv" onClick={e => this.play(question.options[2].author)}>
                            <img src={question.options[2].pic} className="authorPic rounded" alt="author"/>
                            <span className="optionText">{question.options[2].name} </span>
                        </div>
                    </div>
                </div>
            );
        }
    }
}