import React from 'react';
import clone from 'lodash/clone';

import * as RM from './ReversiModel';

const ReversiModel = RM.default;

const tableStyle = {
  borderCollapse: 'collapse',
};
const cellStyle = {
  border: '1px solid gray',
  width: '2em',
  height: '2em',
  textAlign: 'center',
};
const lastCellStyle = clone(cellStyle);
lastCellStyle.backgroundColor = 'lightgray';

export default class ReversiApplication extends React.Component {
  static toStoneText(stoneValue) {
    switch (stoneValue) {
      case RM.StoneBlack:
        return '●';
      case RM.StoneWhite:
        return '〇';
      default:
        return '';
    }
  }
  static countStones(cells, stoneValue) {
    let count = 0;
    cells.forEach((r) => {
      r.forEach((c) => {
        if (c === stoneValue) {
          count += 1;
        }
      });
    });
    return count;
  }
  constructor(props) {
    super();
    this.state = { model: ReversiModel.deserialize(props.data) };
    this.handlePlaceStone = this.handlePlaceStone.bind(this);
    this.handlePass = this.handlePass.bind(this);
  }
  componentWillReceiveProps(newProps) {
    const model = ReversiModel.deserialize(newProps.data);
    this.setState({ model });
  }
  handlePlaceStone(ev) {
    const button = ev.target;
    const x = parseInt(button.getAttribute('data-x'), 10);
    const y = parseInt(button.getAttribute('data-y'), 10);
    this.state.model.addStep(this.state.model.nextTurn, x, y);
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
  }
  handlePass() {
    this.state.model.skipTurn();
    this.props.onEdit(this.state.model.serialize(), this.props.appContext);
  }
  toCell(stoneValue, x, y) {
    if (stoneValue === RM.StoneNone) {
      return <td style={cellStyle}><button onClick={this.handlePlaceStone} data-x={x} data-y={y}>{String.fromCharCode(0x61 + x)}{y + 1}</button></td>;
    }
    const lastStep = this.state.model.steps[this.state.model.steps.length - 1];
    const isLastPos = lastStep.x === x && lastStep.y === y && this.state.model.steps.length > 4;
    const style = isLastPos ? lastCellStyle : cellStyle;
    return <td style={style}>{ReversiApplication.toStoneText(stoneValue)}</td>;
  }
  render() {
    const cells = this.state.model.getCells();
    const rows = cells.map((r, x) => <tr>
      {r.map((c, y) => this.toCell(c, x, y))}
    </tr>);
    return (<div>
      <p>
        Next turn: {ReversiApplication.toStoneText(this.state.model.nextTurn)}
        <button onClick={this.handlePass}>Pass</button>
        {[RM.StoneBlack, RM.StoneWhite].map(c => <span>{ReversiApplication.toStoneText(c)}{ReversiApplication.countStones(cells, c)}</span>)}
      </p>
      <table style={tableStyle}><tbody>{rows}</tbody></table>
    </div>);
  }
}

ReversiApplication.propTypes = {
  data: React.PropTypes.string.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  appContext: React.PropTypes.shape({}).isRequired,
};