import React from 'react'

import './ChalProgress.scss'

export default class ChalProgress extends React.PureComponent {
  state = {
    completed: 0,
    total: 1,
    pct: '0%',
  }

  componentDidMount() {
    this.renderBar()
  }

  componentDidUpdate() {
    if (this.state.completed != this.props.completed || this.state.total != this.props.total || this.props.total >= this.props.completed) {
      this.renderBar()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.completed <= nextProps.total) {
      this.setState({
        completed: nextProps.completed,
        total: nextProps.total,
      })
    }
  }

  renderBar = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setState({
          pct: ((this.state.completed / this.state.total) * 100).toFixed(2) + '%',
        })
      })
    })
  }

  render() {
    const { loading } = this.props

    return (
      <div className={'chal-progress' + (loading ? ' loading' : '')}>
        <span className="progress-pct">{this.state.pct}</span>
        <span className="progress-pts">
          ({this.state.completed} / {this.state.total})
        </span>
        <div className="progress-bar-bg" />
        <div className="progress-bar" style={{ width: this.state.pct }} />
      </div>
    )
  }
}

ChalProgress.defaultProps = {
  loading: true,
  completed: 0,
  total: 100,
}
