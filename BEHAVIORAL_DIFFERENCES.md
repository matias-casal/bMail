# Detailed Differences between AMail and BMail - English Guide

## Introduction

BMail was created as a perfect replica of AMail, but Bob (the junior developer) made some subtle mistakes. Here are the 9 differences found, explained in detail and how to test them.

## 1. **Message when folder is empty**

### What is it?

- **AMail**: Shows a message "No conversations in {folderName}" when there are no emails in the folder
- **BMail**: Shows a message "Empty" when there are no emails in the folder

### How to test it?

1. Go to the "Inbox" folder
2. In AMail: you'll see a message "No conversations in Inbox"
3. In BMail: you'll see a message "Empty"

---

## 2. **Collapse the Last Email in a Thread**

### What is it?

- **AMail**: Does NOT allow collapsing/minimizing the last message when viewing an expanded thread
- **BMail**: DOES allow collapsing/minimizing the last message in an expanded thread

### How to test it?

1. Click on any conversation with multiple messages
2. In the expanded view, try clicking on the last message to collapse it
3. In AMail: you won't be able to collapse it
4. In BMail: you will be able to collapse it

---

## 3. **Spam Button in Trash**

### What is it?

- **AMail**: SHOWS the "Mark as spam" button when viewing messages in trash
- **BMail**: HIDES the "Mark as spam" button in trash

### How to test it?

1. Go to the "Trash" folder
2. Open any message
3. Look for the "Report spam" button in the toolbar
4. In AMail: the button will be visible
5. In BMail: the button will NOT be visible

---

## 4. **Total Count vs Unread**

### What is it?

- **AMail**: Shows the number of UNREAD messages in the inbox (2)
- **BMail**: Shows the TOTAL number of messages in the inbox (7)

### How to test it?

1. Look at the number next to "Inbox" in the sidebar
2. AMail shows "2" (only unread)
3. BMail shows "7" (all messages)

---

## 5. **Spam in "All Mail"**

### What is it?

- **AMail**: Does NOT include spam messages when viewing "All Mail"
- **BMail**: DOES include spam messages in "All Mail"

### How to test it?

1. Go to the "Spam" folder and note how many messages there are (1)
2. Go to "All Mail"
3. Count the total messages
4. In BMail you'll see one more message than in AMail (spam is included)

---

## 6. **Remove Star when Moving to Trash**

### What is it?

- **AMail**: Keeps the star when moving a message to trash
- **BMail**: Automatically removes the star when moving to trash

### How to test it?

1. Star any message
2. Move it to trash (Delete button)
3. Go to trash and verify
4. In AMail: the message will still have a star
5. In BMail: the star will have been removed automatically

---

## 7. **Star on First vs Last Email**

### What is it?

- **AMail**: When a new conversation arrives, the system stars the LAST message
- **BMail**: When a new conversation arrives, the system stars the FIRST message

### How to test it?

1. Look for conversations that already have stars in the inbox
2. Notice which ones are starred: in AMail they'll be different from BMail
3. In AMail: "Amazon" and "Sarah Johnson, Mike Chen" have stars
4. In BMail: "BMail Team" and "Outdoor Club" have stars

## 8. **"You" vs "Me"**

### What is it?

- **AMail**: Uses "me" to refer to the current user
- **BMail**: Uses "you" to refer to the current user

### How to test it?

1. Look for conversations where you appear as a participant
2. In AMail: "Alex Rivera, me"
3. In BMail: "Emma Thompson, you"

---

## 9. **Close Thread when Unstarring in Starred View**

### What is it?

- **AMail**: If you're in "Starred" and remove the last star from a thread, you remain in the thread
- **BMail**: If you're in "Starred" and remove the last star, the thread closes automatically

### How to test it?

1. Go to the "Starred" folder
2. Open a message/thread with a star
3. Remove the star
4. In AMail: you remain viewing the message
5. In BMail: you automatically return to the starred list