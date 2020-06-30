import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {TwitterShareButton, FacebookShareButton, TwitterIcon, FacebookIcon} from "react-share";

const shareUrl = 'https://whosaidthat.net';
const shareText = 'Who said that? A guess game based on latest tweets of celebrities.';

ReactDOM.render(
    <React.StrictMode>
        <div className="App">
            <header className="App-header">
                <div className="container logodiv">
                    <div className="row">
                        <img src="./logo.png" className="logo img-fluid" alt={"logo"}/>
                    </div>
                </div>
                <App/>
                <div className="container sharediv">
                    <div className="row">
                        This game is a serverless application built with
                        <a href="https://lambda.store">
                            <img src="./lstr-logo.png" className="slogo" alt={"logo"}/>
                        </a>
                        and
                        <a href="https://netlify.com">
                            <img src="./netlify-logo.png" className="slogo2" alt={"logo"}/>
                        </a>.
                        See our &nbsp; <a href="https://medium.com/lambda-store/who-said-that-a-tweet-guess-game-implemented-with-serverless-stack-on-netlify-7ae7e9cb0273"> blog </a>&nbsp; for more.
                    </div>
                    <div className="row shareRow">
                        Share this:
                        &nbsp;
                        <TwitterShareButton url={shareUrl} title={shareText}>
                            <TwitterIcon size={32} round/>
                        </TwitterShareButton>
                        &nbsp;
                        <FacebookShareButton url={shareUrl} quote={shareText}>
                            <FacebookIcon size={32} round/>
                        </FacebookShareButton>
                    </div>
                </div>
            </header>

        </div>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
