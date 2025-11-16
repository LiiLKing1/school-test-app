import { db } from '../firebase/config'
import { collection, doc, addDoc, getDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore'

const studentsCol = collection(db, 'students')
const testsCol = collection(db, 'tests')
const resultsCol = collection(db, 'results')
const brainBucksCol = collection(db, 'brainBucks')

export async function registerStudent(firstName, lastName, classNumber, classType) {
  const res = await addDoc(studentsCol, { firstName, lastName, classNumber, classType, time: serverTimestamp() })
  return res.id
}

export async function getStudents() {
  const q = query(studentsCol, orderBy('time', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createTest(testData) {
  const payload = { ...testData, time: serverTimestamp() }
  const res = await addDoc(testsCol, payload)
  return res.id
}

export async function getTests() {
  const q = query(testsCol, orderBy('time', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getTestById(id) {
  const snap = await getDoc(doc(db, 'tests', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function deleteTest(id) {
  await deleteDoc(doc(db, 'tests', id))
}

export async function saveResult(result) {
  const res = await addDoc(resultsCol, { ...result, time: serverTimestamp() })
  return res.id
}

export async function getResults() {
  const q = query(resultsCol, orderBy('time', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getResultById(id) {
  const snap = await getDoc(doc(db, 'results', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function clearAllResults() {
  const snap = await getDocs(resultsCol)
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

export async function deleteResult(id) {
  await deleteDoc(doc(db, 'results', id))
}

export async function createBrainBucksCard(card) {
  // card: { value: number, question: string, answer: string }
  const payload = { ...card, time: serverTimestamp() }
  const res = await addDoc(brainBucksCol, payload)
  return res.id
}

export async function getBrainBucksCards() {
  const q = query(brainBucksCol, orderBy('time', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateBrainBucksCard(id, card) {
  await deleteDoc(doc(db, 'brainBucks', id))
  const payload = { ...card, time: serverTimestamp() }
  const res = await addDoc(brainBucksCol, payload)
  return res.id
}

export async function deleteBrainBucksCard(id) {
  await deleteDoc(doc(db, 'brainBucks', id))
}
