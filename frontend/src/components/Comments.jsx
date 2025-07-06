import { Pen, UserCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toastNotif } from '../utils/toastNotifications';
import { commentService } from '../services/comment';

export default function Comments({ comments, totalComments, recListId, ownerId, updateComment }) {
  const [commentInput, setCommentInput] = useState('')


  const handleSubmit = async (event) => {
    event.preventDefault()

    
    const res = await commentService.addComment(recListId, commentInput)

    if (res === 'good') {
      setCommentInput('')
      updateComment();
      toastNotif.success('Comment created !')
    } else if (res === 'offline') {
      setCommentInput('')
      toastNotif.info( 'You are offline. This comment will be added to this reclist when you are back online')
    } else {
      toastNotif.error('An error occured when creating comment !')
      console.error('An error occured when creating comment')
    }
  }
  
  if (!comments || !recListId) {
    return (
      <div className='font-bold text-xl'>
        Loading...
      </div>
    )
  }

  return (
    <div className='h-full'>
      <div className='w-full h-[1px] bg-gray-800'></div>
      <div className='my-10'>
        <h2>Comments ({totalComments})</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor='commentInput'></label>
          <textarea required value={commentInput} onChange={(event) => { setCommentInput(event.target.value) }} id='commentInput' className='bg-stone-800 w-full h-full shadow-lg p-4' aria-multiline placeholder='Add a comment...'></textarea>
          <div className='flex justify-end pt-2'>
            <button type='submit' className='bg-red-800 rounded p-1 flex gap-1 hover:bg-red-700'>
              <Pen className='w-5 h-5' />
              <p className='font-semibold' >Post reply</p>
            </button>
          </div>
        </form>
      </div>
      <div className='w-full h-[1px] bg-gray-800 mb-4'></div>
      <div className='flex flex-col gap-4'>
        {comments.map(singleComment => (
          <div className='flex gap-3' key={singleComment._id}>
            <UserCircle className='min-w-10 min-h-10' />
            <div className='flex flex-col'>
              <div className='flex gap-2'>
                <span className='font-bold'>{singleComment.userId.username}</span>
                {
                  ownerId === singleComment.userId._id ? <span className='bg-stone-600 rounded'>Author</span> : <></>
                }
              </div>
              <span>{singleComment.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
