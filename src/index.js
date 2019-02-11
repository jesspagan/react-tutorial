import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classNames = 'square ' + (props.value.winner ? 'winner' : null);
  return (
    <button className={classNames} onClick={props.onClick}>
      {props.value.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  createBoard(totalCols, totalRows) {
    let board = [];

    for (let i = 0; i < totalCols; i++) {
      let rows = [];

      for (let j = 0; j < totalRows; j++) {
        rows.push(this.renderSquare(j + i * totalRows));
      }

      board.push(<div className='board-row'>{rows}</div>);
    }
    return board;
  }

  render() {
    return this.createBoard(3, 3);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const square = {
      value: null,
      winner: false
    };
    this.state = {
      history: [
        {
          squares: Array(9).fill({ ...square }),
          position: { col: null, row: null }
        }
      ],
      xIsNext: true,
      stepNumber: 0,
      selectedStep: null,
      sortDescending: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i].value) {
      return;
    }
    const position = {
      col: (i % 3) + 1,
      row: Math.floor(i / 3) + 1
    };

    squares[i] = { ...squares[i], value: this.state.xIsNext ? 'X' : 'O' };
    this.setState({
      history: history.concat([{ squares: squares, position: position }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
      selectedStep: step
    });
  }

  toggleSort() {
    this.setState({ sortDescending: !this.state.sortDescending });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const position = '(' + step.position.col + ',' + step.position.row + ')';
      const desc = move
        ? 'Go to move #' + move + ' ' + position
        : 'Go to game start';
      return (
        <li key={move}>
          <button
            className={
              this.state.selectedStep === move ? 'button-clicked' : null
            }
            onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let sortBy = 'Sort history by: ';
    if (this.state.sortDescending) {
      sortBy += 'Ascending';
      moves.sort((element1, element2) => {
        return element2.key - element1.key;
      });
    } else {
      sortBy += 'Descending';
    }

    let status;
    if (winner) {
      status = 'Winner ' + winner.value;
      const [a, b, c] = winner.line;
      current.squares[a] = { ...current.squares[a], winner: true };
      current.squares[b] = { ...current.squares[b], winner: true };
      current.squares[c] = { ...current.squares[c], winner: true };
    } else if (this.state.stepNumber >= 9) {
      status = 'It is a draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className='game'>
        <div className='game-board'>
          <Board squares={current.squares} onClick={i => this.handleClick(i)} />
        </div>
        <div className='game-info'>
          <div>{status}</div>
          <button onClick={() => this.toggleSort()}>{sortBy}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a].value &&
      squares[a].value === squares[b].value &&
      squares[a].value === squares[c].value
    ) {
      return { value: squares[a].value, line: lines[i] };
    }
  }
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
