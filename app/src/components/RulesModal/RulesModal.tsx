import { Modal } from '../Modal'
import { GameRulesContent } from '../../pages/Rules/components/GameRulesContent'

type RulesModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game rules" size="xl">
      <GameRulesContent showHeader={false} />
    </Modal>
  )
}
