'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Moon, Sun, Plus, ChevronDown, ChevronUp, ThumbsUp, Maximize2, Minimize2, Link, Box, Copy } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CodeSnippet = React.memo(({ code }: { code: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()
  
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
    })
  }, [code, toast])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Button variant="link" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide Code' : 'Show Code'}
          {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {isExpanded && (
        <div className="relative">
          <pre className="bg-muted p-2 rounded-md overflow-x-auto mt-2 max-h-60 w-full">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
})

// Define a proper type for the entry object
interface EntryType {
  id?: string;
  title: string;
  description: string;
  codeSnippet: string;
  variables: string;
  dataAccessibilityText: string;
  embedVideo: string;
  color: string;
  likes: number;
  dateAdded: string;
  image?: string;
}

const EntryCard = React.memo(({ entry, onLike, onOpenPopup }: { entry: EntryType, onLike: () => void, onOpenPopup: () => void }) => {
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <Card className={`relative ${isMinimized ? 'h-16 overflow-hidden' : ''} bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-opacity-100 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <div className={`absolute top-0 left-0 right-0 h-2 ${entry.color}`} />
      <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isMinimized ? 'h-full' : ''}`}>
        <CardTitle className="text-lg">{entry.title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenPopup}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          <CardDescription>{entry.description}</CardDescription>
          <div className="mt-4 space-y-2">
            {entry.image && (
              <div className="w-full flex justify-center mb-4">
                <img src={entry.image || "/placeholder.svg"} alt={entry.title} className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            <CodeSnippet code={entry.codeSnippet} />
            <div>
              <h3 className="font-semibold flex items-center mb-2"><Link className="mr-2 h-4 w-4" /> Variables:</h3>
              <div className="flex flex-wrap gap-2">
                {entry.variables.split(',').map((variable: string, i: number) => (
                  <Badge key={`${entry.id || i}-var-${i}`} variant="outline" className="bg-black text-yellow-300">{variable.trim()}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold flex items-center mb-2"><Box className="mr-2 h-4 w-4" /> Data Accessibility Text:</h3>
              <div className="flex flex-wrap gap-2">
                {entry.dataAccessibilityText.split(',').map((text: string, i: number) => (
                  <Badge key={`${entry.id || i}-dat-${i}`} variant="outline" className="bg-purple-900 text-pink-300">{text.trim()}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              {entry.embedVideo && (
                <div className="w-full aspect-w-16 aspect-h-9 mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(entry.embedVideo)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}
              <div className="text-xs text-muted-foreground mb-2">
                {new Date(entry.dateAdded).toLocaleString()}
              </div>
              <Button variant="outline" onClick={onLike}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Like ({entry.likes})
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
})

export default function Home() {
  const [entries, setEntries] = useState<EntryType[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [password, setPassword] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null)
  const [newEntry, setNewEntry] = useState<EntryType>({
    title: '',
    description: '',
    codeSnippet: '',
    variables: '',
    dataAccessibilityText: '',
    embedVideo: '',
    color: 'bg-white',
    likes: 0,
    dateAdded: '',
    image: ''
  })
  const { toast } = useToast()

  // Define fetchData outside useEffect to use in dependency array
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sheets')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch entries. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // It's okay to leave this empty since fetchData is defined in the component

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== 'bambampogi') {
      toast({
        title: "Error",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
      return
    }
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...newEntry, dateAdded: new Date().toISOString()}),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit data')
      }
      const result = await response.json()
      await fetchData()
      setNewEntry({
        title: '',
        description: '',
        codeSnippet: '',
        variables: '',
        dataAccessibilityText: '',
        embedVideo: '',
        color: 'bg-white',
        likes: 0,
        dateAdded: '',
        image: ''
      })
      setShowForm(false)
      setPassword('')
      toast({
        title: "Success",
        description: `New entry added successfully at row ${result.rowNumber}.`,
      })
    } catch (error) {
      console.error("Error submitting data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLike = async (index: number) => {
    const updatedEntries = [...entries]
    updatedEntries[index].likes += 1
    setEntries(updatedEntries)

    try {
      await fetch('/api/sheets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index, likes: updatedEntries[index].likes }),
      })
    } catch (error) {
      console.error("Error updating likes:", error)
      toast({
        title: "Error",
        description: "Failed to update likes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'dark' : ''}`} style={{
      backgroundImage: 'url()',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      // backgroundColor: '#0F0F0F' 
    }}>
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white bg-opacity-0 p-4 rounded-lg">
        <div className="container mx-auto">
  <header className="flex justify-center items-center mb-8 bg-white bg-opacity-0 p-4 rounded-lg"style={{height: '700px'}} >
    <img 
      src="https://cdn.cara.app/production/posts/a5a7a32e-e519-4fea-9b17-541c6b7d3935/sunpixels-vvLIre32Dvo4gLvdFBfh8-kii2.gif" 
      alt="GSAP Library Logo" 
      className="rounded-lg object-cover w-full h-full" 
    />
    <div className="absolute flex flex-col justify-center items-start" style={{ right: '820px', top: '280px', width: '700px' }}>
      <h1 className="text-white text-3xl font-regular mix-blend-normal" style={{ fontFamily: 'Lato, sans-serif' }}>
        
      </h1>
      <h2 className="text-white text-9xl font-bold mix-blend-normal" style={{ fontFamily: 'Lato, sans-serif' }}>
        GreenSock Animation Platform
      </h2>
      <h3 className="text-white text-3xl font-regular mix-blend-normal" style={{ fontFamily: 'Lato, sans-serif' }}>
        Library of codes for utilization in Storyline 360
      </h3>
    </div>
  </header>
</div>

          <div className="fixed top-4 right-4 flex gap-4 z-50">
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add New Entry
            </Button>
            <Button onClick={toggleDarkMode} variant="outline" size="icon">
              {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </header>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white bg-opacity-20"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-white">Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center text-white">No entries found. Add a new entry to get started!</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry, index) => (
              <EntryCard
                key={`entry-${entry.id || index}`}
                entry={entry}
                onLike={() => handleLike(index)}
                onOpenPopup={() => setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Entry</DialogTitle>
              <DialogDescription>Fill in the details for your new library entry. Please take note that only those with the correct password can submit this form.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newEntry.title}
                    onChange={handleInputChange}
                    placeholder="Title of the Functionality/Feature"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newEntry.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codeSnippet">JS Code Snippet</Label>
                  <Textarea
                    id="codeSnippet"
                    name="codeSnippet"
                    value={newEntry.codeSnippet}
                    onChange={handleInputChange}
                    placeholder="JS code snippet"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="variables">Variables</Label>
                  <Input
                    id="variables"
                    name="variables"
                    value={newEntry.variables}
                    onChange={handleInputChange}
                    placeholder="Variables (comma-separated)"
                  />
                
                </div>
                <div>
                  <Label htmlFor="dataAccessibilityText">Data Accessibility Text</Label>
                  <Input
                    id="dataAccessibilityText"
                    name="dataAccessibilityText"
                    value={newEntry.dataAccessibilityText}
                    onChange={handleInputChange}
                    placeholder="Data Accessibility Text (comma-separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="embedVideo">Video URL</Label>
                  <Input
                    id="embedVideo"
                    name="embedVideo"
                    value={newEntry.embedVideo}
                    onChange={handleInputChange}
                    placeholder="YouTube video URL"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={newEntry.image}
                    onChange={handleInputChange}
                    placeholder="Image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select name="color" onValueChange={(value) => setNewEntry({...newEntry, color: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-white">White</SelectItem>
                      <SelectItem value="bg-red-500">Red</SelectItem>
                      <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                      <SelectItem value="bg-green-500">Green</SelectItem>
                      <SelectItem value="bg-blue-500">Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Without the correct password you cannot submit this form"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Add Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedEntry.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>{selectedEntry.description}</p>
                
                {selectedEntry.image && (
                  <div className="w-full flex justify-center mb-4">
                    <img src={selectedEntry.image || "/placeholder.svg"} alt={selectedEntry.title} className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
                
                <CodeSnippet code={selectedEntry.codeSnippet} />
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><Link className="mr-2 h-4 w-4" /> Variables:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.variables.split(',').map((variable: string, index: number) => (
                      <Badge key={`${selectedEntry.id || 'selected'}-var-${index}`} variant="outline" className="bg-black text-yellow-300">{variable.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-2"><Box className="mr-2 h-4 w-4" /> Data Accessibility Text:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.dataAccessibilityText.split(',').map((text: string, index: number) => (
                      <Badge key={`${selectedEntry.id || 'selected'}-dat-${index}`} variant="outline" className="bg-purple-900 text-pink-300">{text.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  {selectedEntry.embedVideo && (
                    <div className="w-full aspect-w-16 aspect-h-9 mb-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedEntry.embedVideo)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(selectedEntry.dateAdded).toLocaleString()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

function getYouTubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}