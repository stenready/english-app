// Where AppModal's panel sits on the screen
const modalPositions = {
  CENTER: 'center',
  // Near the top: the panel doesn't jump when its content grows
  TOP: 'top',
} as const

export type ModalPosition = (typeof modalPositions)[keyof typeof modalPositions]

export default modalPositions
