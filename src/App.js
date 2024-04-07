import './App.css';
import 'chart.js/auto';
import React from "react";
import {Chart} from 'chart.js'
import {Pie} from 'react-chartjs-2';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import {Button, Stack, styled} from "@mui/material";

/*
Punctuation (or sometimes interpunction) is the use of spacing, conventional signs (called punctuation marks), 
and certain typographical devices as aids to the understanding and correct reading of written text, whether read silently or aloud.[1] 
Another description is, "It is the practice, action, or system of inserting points or other small marks into texts in order to aid
interpretation; division of text into sentences, clauses, etc., by means of such marks."[2]

In written English, punctuation is vital to disambiguate the meaning of sentences. 
For example: "woman, without her man, is nothing" (emphasizing the importance of men to women), and "woman: without her, man is nothing"
(emphasizing the importance of women to men) have very different meanings; as do "eats shoots and leaves" (which means the subject consumes plant growths)
and "eats, shoots, and leaves" (which means the subject eats first, then fires a weapon, and then leaves the scene).[3] 
The sharp differences in meaning are produced by the simple differences in punctuation within the example pairs, especially the latter.

The rules of punctuation vary with language, location, register, and time and are constantly evolving. Certain aspects of punctuation are stylistic and
are thus the author's (or editor's) choice, or tachygraphic (shorthand) language forms, such as those used in online chat and text messages. 

Wikimedia Foundation. (2022, May 17). Punctuation. Wikipedia. Retrieved May 19, 2022, from https://en.wikipedia.org/wiki/Punctuation
*/

function App() {
  return (
    <div className="App">
        <a className="App-image" href="https://github.com/amichaelyu/punctuation" aria-label="Source Code"
           rel="noopener noreferrer">
            <svg className="Filter" height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
        </a>
      <header className="App-header">
          <span className="App-title-text">Punctuation Only</span>
          <Worker></Worker>
      </header>
    </div>
  );
}

Chart.defaults.color = "#fff";

const Input = styled('input')({
    display: 'none',
});

class Worker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            original: '',
            modified: '',
            disabled: 1,
            reg: '',
            labels: [],
            data: [],
            datasets: [{
                data: [],
                // 13 colors
                backgroundColor: ['red', 'green', 'blue', 'purple', 'yellow', 'pink', 'orange', 'violet', 'brown', 'gray', 'white', 'black', 'cyan'],
                fontColor: ['white'],
                borderWidth: 0,
            }]
        };
        this.handleChange = this.handleChange.bind(this);
    }

    async handleChange(event) {
        this.setState({original: event.target.value});
        await this.updateRegex();
        this.setState({modified: this.findPunctuation(event.target.value)});
        this.updateChart(this.findPunctuation(event.target.value));
    }

    updateRegex() {
        let regPure = /[…[\].,/!?'"“”;:{}\-–—()]/g;
        let regAll = /[`_~@#$%^&*–\\+=<>|…[\].,/!?'"“”;:{}\-—()]/g;
        this.setState({reg: (this.state.disabled === 1 ? regPure : regAll)});
    }

    findPunctuation(str) {
        let text = "";
        if (str.match(this.state.reg) != null) {
            str.match(this.state.reg).forEach(function (x) {
                text += (x === "“" || x === "”") ? "\"" : x;
            });
        }
        return text;
    }

    count(text) {
        let count = new Map();
        for(let x in text) {
            if(count.has(text.charAt(x))) {
                count.set(text.charAt(x), count.get(text.charAt(x))+1);
            } else {
                count.set(text.charAt(x), 1);
            }
        }
        return count;
    }

    updateChart(text) {
        let count = this.count(text);
        let keys = [], vals = [];
        for (const [key, value] of count) {
            keys.push(key);
            vals.push(value);
        }
        this.setState({labels: keys, data: vals, datasets: [{data: vals}]});
    }

    countPrinter(labels, data) {
        let text = "";
        for (let i in labels) {
            text += labels[i] + " " + data[i] + "\n";
        }
        return text;
    }

    handleFileChosen = async (file) => {
        file.preventDefault();
        const reader = new FileReader();
        if (file.target.files[0].type === "text/plain") {
            reader.onload = async (file) => {
                const text = (file.target.result);
                this.setState({original: text});
                this.handleChange({target: {value: text}});
            };
            reader.readAsText(file.target.files[0]);
        }
        else {
            reader.onload = async (file) => {
                let zip = new PizZip(file.target.result);
                let doc = new Docxtemplater().loadZip(zip)
                let text = doc.getFullText();
                this.setState({original: text});
                this.handleChange({target: {value: text}});
            };
            reader.readAsBinaryString(file.target.files[0]);
        }
    };

    async buttonFunc(num) {
        await this.setState({disabled: num});
        this.handleChange({target: {value: this.state.original}});
    };

    render() {
        return (
            <span>
                <Stack sx={{mr:7}} className="App-button-stack" direction="row" alignItems="center" spacing={1}>
                    <Button variant={this.state.disabled === 1 ? "contained" :  "outlined"} onClick={() => this.buttonFunc(1)}>Pure</Button>
                    <Button variant={this.state.disabled === 2 ? "contained" :  "outlined"} onClick={() => this.buttonFunc(2)}>All</Button>
                </Stack>
                <h1><span id="space">Input</span><span id="space">Output</span></h1>
                <textarea className="App-input" value={this.state.original} onChange={this.handleChange} />
                <textarea className="App-output" readOnly={true} value={this.state.modified} />
                <label className="App-file-selector" htmlFor="contained-button-file">
                    <Input id="contained-button-file" multiple type="file" accept=".txt,.docx,.dotx,.docm,.dotm" onChange={file => this.handleFileChosen(file)} />
                    <Button sx={{ mt: 1}} variant="contained" component="span">
                        Upload
                    </Button>
                </label>
                <textarea className="App-counter" readOnly={true} disabled={true} value={this.countPrinter(this.state.labels, this.state.data)} />
                <div className="App-pie">
                    <Pie data={{
                        labels: this.state.labels,
                        datasets: this.state.datasets,
                    }}
                    />
                </div>
            </span>
        );
    }
}

export default App;
