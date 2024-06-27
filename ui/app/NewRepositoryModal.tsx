"use client"

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, ButtonGroup } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export const NewRepositoryModal = () => {
  const router = useRouter();

  const [isModalOpen, setIsOpenModal] = useState(false);
  const [organization, setOrganization] = useState('');
  const [repository, setRepository] = useState('');

  const onSubmit = () => {
    router.push(`/organizations/${organization}/repositories/${repository}`);
  }

  return (
    <>
      <Button
        color="default"
        style={{ backgroundColor: "#2b3137" }}
        onPress={() => setIsOpenModal(true)}
      >
        Fund Other Repository
      </Button>
      <Modal
        size="md"
        isOpen={isModalOpen}
        onClose={() => setIsOpenModal(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Fund New Repository</ModalHeader>
              <ModalBody>
                <div className="w-full flex flex-col gap-4">
                  <Input
                    autoFocus
                    label="Organization"
                    placeholder="Enter organization"
                    variant="underlined"
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                  <Input
                    label="Repository"
                    placeholder="Enter repository"
                    variant="underlined"
                    onChange={(e) => setRepository(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onSubmit} disabled={!organization || !repository} isDisabled={!organization || !repository}>
                  Go to Repository
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}