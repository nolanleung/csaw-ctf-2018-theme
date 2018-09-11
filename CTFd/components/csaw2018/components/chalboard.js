import axios from 'axios'
import React from 'react'
import { render } from 'react-dom'

import ChalToolbar from './ChalToolbar'
import ChalGrid from './ChalGrid'
import ChalModal from './ChalModal'

import './Chalboard.scss'

class Chalboard extends React.Component {
  state = {
    loadingChals: true,
    loadingSolves: true,
    challenges: [],
    solves: [],
    chalSolves: {},
    challengeCategories: [],
    categoryFilters: [],
    completedOptions: [{ label: 'Completed', value: 'completed' }, { label: 'Not Completed', value: 'not_completed' }],
    completedFilters: [{ label: 'Completed', value: 'completed' }, { label: 'Not Completed', value: 'not_completed' }],
    sortFilter: 'points_asc',
    totalPoints: 1,
    solvedPoints: 0,
    activeChallenge: null,
    keyResponse: null,
  }

  keyTO = null
  refreshInterval = setInterval(this.refresh, 60 * 1000)

  componentWillMount() {
    this.setup()
  }

  setup = async () => {
    await Promise.all([this.loadChals(), this.loadSolves()])

    // Open chal modal if challenge found in hash
    const hashChal = location.hash.substr(1)
    if (hashChal) {
      const chal = this.state.challenges.filter(c => c.name === hashChal)[0]

      if (chal) {
        this.showChallenge(chal)
      }
    }
  }

  loadChals = async () => {
    const {
      data: { game: challenges },
    } = await axios.get('/chals')

    let totalPoints = 0
    const challengeCategories = [
      ...challenges.reduce((set, chal) => {
        totalPoints += chal.value
        set.add(chal.category)
        return set
      }, new Set()),
    ]
      .sort()
      .map(category => ({
        label: category,
        value: category,
      }))

    this.setState({
      challenges,
      challengeCategories,
      categoryFilters: challengeCategories,
      totalPoints,
      loadingChals: false,
    })
  }

  loadSolves = async () => {
    const solves = (await axios.get('/solves')).data.solves

    const solvedPoints = solves.reduce((points, solve) => {
      points += solve.value
      return points
    }, 0)

    this.setState({
      solves: solves,
      solvedPoints: solvedPoints,
      loadingSolves: false,
    })
  }

  loadChalSolves = async chal => {
    if (!chal) return

    const {
      data: { items: chalSolves },
    } = await axios.get('/chal/' + chal.id + '/solves')
    this.setState(state => {
      const mChalSolves = Object.assign({}, { ...state.chalSolves }, { [chal.id]: chalSolves })
      return { chalSolves: mChalSolves }
    })
  }

  getChals = () => {
    const categoryFilters = this.state.categoryFilters.map(f => f.value)
    const completedFilters = this.state.completedFilters.map(f => f.value)
    return this.state.challenges
      .filter(
        chal =>
          categoryFilters.includes(chal.category) && completedFilters.includes(this.isSolved(chal.id) ? 'completed' : 'not_completed'),
      )
      .sort(this.getSortFunc())
  }

  refresh = async () => {
    await this.loadChals()
    await this.loadSolves()
  }

  isSolved = chalid => {
    return Boolean(this.state.solves.find(s => s.chalid === chalid))
  }

  updateCategoryFilters = categories => {
    this.setState({ categoryFilters: categories })
  }

  updateCompletedFilters = completedFilters => {
    this.setState({ completedFilters: completedFilters })
  }

  updateSortFilter = filter => {
    this.setState({ sortFilter: filter })
  }

  getSortFunc = () => {
    switch (this.state.sortFilter) {
      case 'name_asc':
        return (a, b) => {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          return aName > bName ? 1 : aName < bName ? -1 : 0
        }
      case 'name_desc':
        return (a, b) => {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          return aName > bName ? -1 : aName < bName ? 1 : 0
        }
      case 'category_asc':
        return (a, b) => {
          const aCategory = a.category.toLowerCase()
          const bCategory = b.category.toLowerCase()
          return aCategory > bCategory ? 1 : aCategory < bCategory ? -1 : a.value > b.value ? 1 : a.value < b.value ? -1 : 0
        }
      case 'category_desc':
        return (a, b) => {
          const aCategory = a.category.toLowerCase()
          const bCategory = b.category.toLowerCase()
          return aCategory > bCategory ? -1 : aCategory < bCategory ? 1 : a.value > b.value ? 1 : a.value < b.value ? -1 : 0
        }
      case 'points_desc':
        return (a, b) => {
          return a.value > b.value ? -1 : a.value < b.value ? 1 : 0
        }
      case 'points_asc':
      default:
        return (a, b) => {
          return a.value > b.value ? 1 : a.value < b.value ? -1 : 0
        }
    }
  }

  showChallenge = chal => {
    this.loadChalSolves(chal)
    this.setState({
      activeChallenge: chal,
      keyResponse: null,
    })

    location.hash = chal ? chal.name : ''
  }

  hideModal = e => {
    if (!e.target.className.includes('chal-modal-container')) {
      return
    }

    this.showChallenge(null)
  }

  submitKey = async key => {
    clearTimeout(this.keyTO)

    const data = new FormData()

    data.append('nonce', document.getElementById('nonce').value)
    data.append('key', key)

    const { data: resp } = await axios.post('/chal/' + this.state.activeChallenge.id, data)

    this.setState({
      keyResponse: resp,
    })

    if (resp.status === 0) {
      this.keyTO = setTimeout(() => {
        this.setState({ keyResponse: null })
      }, 2000)
    } else if (resp.status === 1) {
      this.refresh()
    }
  }

  render() {
    return (
      <div className="chalboard container">
        <ChalToolbar
          categories={this.state.challengeCategories}
          categoryFilters={this.state.categoryFilters}
          onUpdateCategoryFilters={this.updateCategoryFilters}
          completedOptions={this.state.completedOptions}
          completedFilters={this.state.completedFilters}
          onUpdateCompletedFilters={this.updateCompletedFilters}
          sortFilter={this.state.sortFilter}
          onUpdateSortFilter={this.updateSortFilter}
          progressLoading={this.state.loadingChals || this.state.loadingSolves}
          totalPoints={this.state.totalPoints}
          solvedPoints={this.state.solvedPoints}
        />
        <ChalGrid
          challenges={this.getChals()}
          solves={this.state.solves}
          loading={this.state.loadingChals}
          showChallenge={this.showChallenge}
        />
        <ChalModal
          challenge={this.state.activeChallenge}
          solves={this.state.chalSolves[this.state.activeChallenge && this.state.activeChallenge.id]}
          hide={this.hideModal}
          submit={this.submitKey}
          response={this.state.keyResponse}
        />
      </div>
    )
  }
}

render(<Chalboard />, document.getElementById('challenges-container'))
