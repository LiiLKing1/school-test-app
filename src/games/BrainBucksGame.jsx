import { useEffect, useMemo, useState } from 'react'
import { getBrainBucksCards } from '../utils/firestore'

const ROW_VALUES = [100, 200, 300, 400, 500]
const COL_COUNT = 5
const TOTAL_CELLS = ROW_VALUES.length * COL_COUNT

export default function BrainBucksGame() {
  const [stage, setStage] = useState('teams')
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team 1', score: 0 },
    { id: 2, name: 'Team 2', score: 0 },
    { id: 3, name: 'Team 3', score: 0 },
  ])
  const [nextTeamId, setNextTeamId] = useState(4)
  const [activeTeamId, setActiveTeamId] = useState(1)

  const [cards, setCards] = useState([])
  const [loadingCards, setLoadingCards] = useState(true)

  const [usedCells, setUsedCells] = useState({})
  const [valuePointers, setValuePointers] = useState({})

  const [modal, setModal] = useState({ open: false, value: null, question: '', answer: '', showAnswer: false })

  useEffect(() => {
    const load = async () => {
      setLoadingCards(true)
      const data = await getBrainBucksCards()
      setCards(data)
      setLoadingCards(false)
    }
    load()
  }, [])

  const cardsByValue = useMemo(() => {
    const map = {}
    for (const c of cards) {
      if (!map[c.value]) map[c.value] = []
      map[c.value].push(c)
    }
    return map
  }, [cards])

  const handleAddTeam = () => {
    setTeams(ts => [...ts, { id: nextTeamId, name: `Team ${nextTeamId}`, score: 0 }])
    setNextTeamId(id => id + 1)
  }

  const handleRemoveTeam = (id) => {
    setTeams(ts => ts.filter(t => t.id !== id))
    setActiveTeamId(prev => {
      if (prev === id && teams.length > 1) {
        const remaining = teams.filter(t => t.id !== id)
        return remaining[0]?.id ?? null
      }
      return prev
    })
  }

  const handleTeamNameChange = (id, name) => {
    setTeams(ts => ts.map(t => t.id === id ? { ...t, name } : t))
  }

  const handleStartGame = () => {
    if (teams.length === 0) return
    setStage('board')
    if (!activeTeamId && teams[0]) setActiveTeamId(teams[0].id)
  }

  const updateTeamScore = (teamId, delta) => {
    setTeams(ts => ts.map(t => t.id === teamId ? { ...t, score: t.score + delta } : t))
  }

  const advanceTurn = () => {
    if (teams.length === 0 || !activeTeamId) return
    const idx = teams.findIndex(t => t.id === activeTeamId)
    if (idx === -1) return
    const next = teams[(idx + 1) % teams.length]
    setActiveTeamId(next.id)
  }

  const handleCellClick = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`
    if (usedCells[key]) return

    const value = ROW_VALUES[rowIndex]
    const list = cardsByValue[value] || []
    const pointer = valuePointers[value] || 0
    const card = list[pointer]

    const question = card?.question || 'Savol bu qiymat uchun topilmadi.'
    const answer = card?.answer || ''

    setModal({ open: true, value, question, answer, showAnswer: false })

    setUsedCells(prev => ({ ...prev, [key]: true }))
    if (card) {
      setValuePointers(prev => ({ ...prev, [value]: pointer + 1 }))
    }
  }

  const closeModal = () => {
    setModal(m => ({ ...m, open: false }))
  }

  const handleCorrect = () => {
    if (!modal.value || !activeTeamId) {
      closeModal()
      return
    }
    updateTeamScore(activeTeamId, modal.value)
    closeModal()
    advanceTurn()
  }

  const handleIncorrect = () => {
    if (!modal.value || !activeTeamId) {
      closeModal()
      return
    }
    updateTeamScore(activeTeamId, -modal.value)
    closeModal()
    advanceTurn()
  }

  const allCellsUsed = useMemo(() => Object.keys(usedCells).length >= TOTAL_CELLS, [usedCells])

  useEffect(() => {
    if (stage === 'board' && !modal.open && allCellsUsed) {
      setStage('results')
    }
  }, [stage, modal.open, allCellsUsed])

  const skipWithRandomScores = () => {
    // temporary helper previously used for testing results UI
    setTeams(ts => ts.map(t => ({
      ...t,
      score: Math.floor(Math.random() * 21) * 100,
    })))
    setStage('results')
  }

  if (stage === 'teams') {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Brain Bucks</h1>
        <div className="relative max-w-xl mx-auto mt-4">
          <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
          <div className="relative border-2 border-black bg-white p-5 space-y-4">
            <h2 className="text-2xl font-bold">Add teams</h2>
            <div className="flex flex-wrap gap-3">
              {teams.map(team => (
                <div key={team.id} className="border-2 border-black px-3 py-2 min-w-[120px] flex items-center gap-2 bg-base-100">
                  <input
                    className="bg-transparent flex-1 min-w-0 outline-none"
                    value={team.name}
                    onChange={e => handleTeamNameChange(team.id, e.target.value)}
                  />
                  {teams.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => handleRemoveTeam(team.id)}
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center gap-3 pt-2">
              <button type="button" className="inline-block bg-black text-white px-6 py-2 rounded-none" onClick={handleAddTeam}>
                Add team
              </button>
              <button
                type="button"
                className="inline-block bg-black text-white px-6 py-2 rounded-none disabled:opacity-40"
                onClick={handleStartGame}
                disabled={teams.length === 0}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'results') {
    const ranked = [...teams].sort((a, b) => b.score - a.score)
    const maxScore = ranked[0]?.score || 1
    return (
      <div className="space-y-6 relative">
        <h1 className="text-4xl font-extrabold tracking-tight">Brain Bucks results</h1>
        <div className="relative border-2 border-black bg-white p-5 space-y-6">
          {/* confetti strip */}
          <div className="h-10 -mx-5 -mt-5 mb-4 border-b border-black bg-white overflow-hidden relative">
            <div className="absolute inset-x-0 -top-6 h-16 bg-[radial-gradient(circle_at_10%_20%,#f97316_0,transparent_55%),radial-gradient(circle_at_30%_80%,#22c55e_0,transparent_55%),radial-gradient(circle_at_60%_30%,#3b82f6_0,transparent_55%),radial-gradient(circle_at_80%_70%,#e11d48_0,transparent_55%)] opacity-90" />
          </div>

          <h2 className="text-2xl font-bold">Final ranking</h2>
          <div className="space-y-4">
            {ranked.map((team, index) => (
              <div key={team.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-sm md:text-base">
                  <div className="font-semibold break-words">
                    {index + 1}-place: {team.name}
                  </div>
                  <div>{team.score}$</div>
                </div>
                <div className="h-4 bg-white border border-black flex">
                  <div
                    className="h-full bg-black"
                    style={{ width: `${Math.max(5, (team.score / maxScore) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 3D podium */}
          {ranked.length > 0 && (
            <div className="mt-8">
              <div className="flex items-end justify-center gap-4">
                {/* 2nd place */}
                {ranked[1] && (
                  <div className="flex flex-col items-center gap-2 text-xs md:text-sm">
                    <div className="font-medium truncate max-w-[120px] text-center">{ranked[1].name}</div>
                    <div className="px-3 py-1 rounded-full bg-black text-white text-[10px] md:text-xs">
                      {ranked[1].score}$
                    </div>
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
                      2
                    </div>
                  </div>
                )}

                {/* 1st place */}
                {ranked[0] && (
                  <div className="flex flex-col items-center gap-2 text-xs md:text-sm">
                    <div className="text-2xl">🏆</div>
                    <div className="font-semibold truncate max-w-[140px] text-center">{ranked[0].name}</div>
                    <div className="px-3 py-1 rounded-full bg-black text-white text-[10px] md:text-xs">
                      {ranked[0].score}$
                    </div>
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-800 text-white flex items-center justify-center text-3xl font-bold shadow-[0_14px_30px_rgba(0,0,0,0.4)]">
                      1
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {ranked[2] && (
                  <div className="flex flex-col items-center gap-2 text-xs md:text-sm">
                    <div className="font-medium truncate max-w-[120px] text-center">{ranked[2].name}</div>
                    <div className="px-3 py-1 rounded-full bg-black text-white text-[10px] md:text-xs">
                      {ranked[2].score}$
                    </div>
                    <div className="w-20 h-16 md:w-24 md:h-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
                      3
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Brain Bucks</h1>
      {loadingCards && <div className="loading loading-spinner" />}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-6">
        <div className="space-y-3">
          {teams.map(team => (
            <button
              key={team.id}
              type="button"
              onClick={() => setActiveTeamId(team.id)}
              className={`w-full text-left border-2 border-black px-4 py-3 flex items-center justify-between gap-3 ${team.id === activeTeamId ? 'bg-black text-white' : 'bg-white'}`}
            >
              <div className="min-w-0">
                <div className="font-bold break-words">{team.name}</div>
                <div className="text-sm">Score: {team.score}$</div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="btn btn-xs rounded-none"
                  onClick={e => { e.stopPropagation(); updateTeamScore(team.id, 100) }}
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn btn-xs rounded-none"
                  onClick={e => { e.stopPropagation(); updateTeamScore(team.id, -100) }}
                >
                  -
                </button>
              </div>
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
          <div className="relative border-2 border-black bg-white p-4">
            <div className="grid grid-rows-5 gap-3">
              {ROW_VALUES.map((value, rowIndex) => (
                <div key={value} className="grid" style={{ gridTemplateColumns: `repeat(${COL_COUNT}, minmax(0, 1fr))`, gap: '12px' }}>
                  {Array.from({ length: COL_COUNT }).map((_, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`
                    const used = usedCells[key]
                    return (
                      <button
                        key={colIndex}
                        type="button"
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        disabled={used}
                        className={`border-2 border-black py-4 text-center text-lg font-bold ${used ? 'bg-base-200 text-base-content/40' : 'bg-base-100 hover:bg-black hover:text-white'}`}
                      >
                        {value}$
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control: End game (real) */}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="btn btn-sm rounded-none btn-error"
          onClick={() => {
            if (confirm('Siz haqiqatdan ham o\'yinni tugatmoqchimisiz?')) {
              setStage('results')
            }
          }}
        >
          End game
        </button>
      </div>

      {modal.open && (
        <dialog open className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-3xl border-2 border-black rounded-none">
            <h3 className="font-bold text-lg mb-3">{modal.value}$ question</h3>
            <div className="space-y-3">
              <div className="border-2 border-black p-3 min-h-[100px]">
                {modal.question}
              </div>
              {modal.answer && (
                <div className={`border-2 border-dashed border-black p-3 min-h-[60px] text-sm ${modal.showAnswer ? 'opacity-80' : 'blur-sm select-none opacity-60'}`}>
                  Answer: {modal.answer}
                </div>
              )}
              {!modal.showAnswer && (
                <button
                  type="button"
                  className="btn btn-sm rounded-none"
                  onClick={() => setModal(m => ({ ...m, showAnswer: true }))}
                >
                  Show answer
                </button>
              )}
              <div className="text-sm opacity-70">
                Active team: {teams.find(t => t.id === activeTeamId)?.name || 'None'}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn rounded-none" onClick={closeModal}>Close</button>
                <button type="button" className="btn rounded-none" onClick={handleIncorrect}>- {modal.value}$</button>
                <button type="button" className="btn btn-primary rounded-none" onClick={handleCorrect}>+ {modal.value}$</button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
