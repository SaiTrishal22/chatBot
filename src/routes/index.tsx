// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import CreateChat from '../components/CreateChat'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: ChatComponent,
 
})

function ChatComponent() {
  
    return(
        <>
         <CreateChat />
         <Outlet />
        </>
    )
}