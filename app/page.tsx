'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, ChevronDown, ChevronUp, ThumbsUp, Maximize2, Link, Box, Copy, LayoutGrid, LayoutList, FileText, ExternalLink } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiveChat } from '@/components/LiveChat'
import gsap from 'gsap'
import dynamic from 'next/dynamic'

const Tiptap = dynamic(() => import('@/components/Tiptap'), { ssr: false })

// Define proper types
interface EntryType {
  id?: string;
  title: string;
  description: string;
  codeSnippet: string;
  variables: string;
  dataAccessibilityText: string;
  documentationUrl: string;
  embedVideo: string;
  color: string;
  likes: number;
  dateAdded: string;
  image?: string;
}

const CodeSnippet = React.memo(({ code }: { code: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "The code snippet has been copied to your clipboard.",
          })
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err)
          toast({
            title: "Error",
            description: "Failed to copy to clipboard. Please try again.",
            variant: "destructive",
          })
        })
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast({
          title: "Copied to clipboard",
          description: "The code snippet has been copied to your clipboard.",
        })
      } catch (err) {
        console.error('Failed to copy text: ', err)
        toast({
          title: "Error",
          description: "Failed to copy to clipboard. Please try again.",
          variant: "destructive",
        })
      }
      document.body.removeChild(textArea)
    }
  }, [code, toast])

  return (
    <div className="w-full">
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
            <code className="whitespace-pre-wrap break-words">{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
})

const EntryCard = React.memo(({ entry, onLike, onOpenPopup }: { entry: EntryType, onLike: () => void, onOpenPopup: () => void }) => {
  const [imageError, setImageError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = cardRef.current;
    if (currentRef) {
      currentRef.addEventListener('mouseenter', handleMouseEnter)
      currentRef.addEventListener('mouseleave', handleMouseLeave)
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('mouseenter', handleMouseEnter)
        currentRef.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)', 
        duration: 0.3 
      })
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { 
        boxShadow: 'none', 
        duration: 0.3 
      })
    }
  }

  return (
    <div ref={cardRef} className="relative bg-black bg-opacity-95 backdrop-filter border-opacity-100 shadow-lg transition-shadow duration-300 h-full">
      <Card>
        <div className={`absolute top-0 left-0 right-0 h-2 ${entry.color}`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col gap-2 flex-1">
            <CardTitle className="text-2xl">{entry.title}</CardTitle>
            
            
          </div>
          <Button variant="ghost" size="icon" onClick={onOpenPopup}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              {entry.image && !imageError && (
                <div className="w-full flex justify-center mb-4">
                  <img 
                    src={entry.image.trim() || "/placeholder.svg"}
                    alt={entry.title || 'Entry image'} 
                    className="max-w-full h-auto rounded-lg" 
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-semibold flex items-center mb-2 text-lg"><Link className="mr-2 h-5 w-5" /> Variables:</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.variables.split(',').map((variable: string, i: number) => (
                    <Badge key={`${entry.id || i}-var-${i}`} variant="outline" className="bg-black text-yellow-300 text-sm">{variable.trim()}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold flex items-center mb-2 text-lg"><Box className="mr-2 h-5 w-5" /> Data Accessibility Text:</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.dataAccessibilityText.split(',').map((text: string, i: number) => (
                    <Badge key={`${entry.id || i}-dat-${i}`} variant="outline" className="bg-purple-900 text-pink-300 text-sm">{text.trim()}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-auto">
                <CodeSnippet code={entry.codeSnippet} />
              </div>
            </div>
            <div>
              <div className="text-lg mb-4 max-h-60 overflow-y-auto text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: entry.description }} />
           
           {/* ==================== CENTERED DOCUMENTATION BUTTON ==================== */}
            {entry.documentationUrl && entry.documentationUrl.trim() !== '' && (
              <div className="mt-6 mb-4 flex justify-center">
                {/* ↑ Container with spacing and centering */}
                
                <a 
                  href={entry.documentationUrl.trim()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  View Documentation
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            {/* ==================== END CENTERED BUTTON ==================== */}
              </div>
              <div className="flex flex-col items-center mt-4">
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
                <div className="text-sm text-muted-foreground mb-2">
                  {new Date(entry.dateAdded).toLocaleString()}
                </div>
                <Button variant="outline" onClick={onLike}>
                  <ThumbsUp className="mr-2 h-4 w-4" /> Like ({entry.likes})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default function Home() {
  const [entries, setEntries] = useState<EntryType[]>([])
  const [darkMode, setDarkMode] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [password, setPassword] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<EntryType | null>(null)
  const [showStickySearch, setShowStickySearch] = useState(false)
  const [gridView, setGridView] = useState(false)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortOrder, setSortOrder] = useState('desc')
  const [newEntry, setNewEntry] = useState<EntryType>({
    title: '',
    description: '',
    codeSnippet: '',
    variables: '',
    dataAccessibilityText: '',
    documentationUrl: '', 
    embedVideo: '',
    color: '',
    likes: 0,
    dateAdded: '',
    image: ''
  })
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sheets')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received')
      }

      const validEntries = data.filter((entry: EntryType) => {
        if (!entry || typeof entry !== 'object') {
          return false
        }
        return true
      })

      setEntries(validEntries)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch entries. Please check the console for more details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    window.addEventListener('scroll', handleScroll)
    initializeCustomCursor()
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleScroll = () => {
    if (searchBarRef.current) {
      const searchBarPosition = searchBarRef.current.getBoundingClientRect().top
      setShowStickySearch(searchBarPosition < 0)
    }
  }

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

  const handleDescriptionChange = (content: string) => {
    setNewEntry({ ...newEntry, description: content })
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
        documentationUrl: '', 
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

  const initializeCustomCursor = () => {
    const cursor = document.createElement('img');
    cursor.src = 'https://www.clipartmax.com/png/full/274-2749351_pixels-gif-and-kawaii-image-pizza-pixel.png';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.width = '32px';
    cursor.style.height = '32px';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  }

  const sortEntries = (entriesToSort: EntryType[]) => {
    return [...entriesToSort].sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return sortOrder === 'asc'
          ? new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === 'likes') {
        return sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes;
      }
      return 0;
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredEntries = sortEntries(entries.filter(entry =>
    entry && entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  ))

  return (
    <div 
      className={`min-h-screen p-8 ${darkMode ? 'dark' : ''}`} 
      style={{
        backgroundImage: 'url(https://i.pinimg.com/originals/90/70/32/9070324cdfc07c68d60eed0c39e77573.gif)', 
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        overflowX: 'hidden',
        zoom: '0.75',
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backgroundBlendMode: 'overlay',
        cursor: 'none',
      }}
    >
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white bg-opacity-0 p-4 rounded-lg" style={{height: '700px', position: 'relative'}}>
          <img 
            src="https://cdna.artstation.com/p/assets/images/images/054/914/386/original/squaresprout-deer-lake-slim.gif?1665663701" 
            alt="JRD Library Logo" 
            className="rounded-lg object-cover w-full h-full absolute inset-0" 
          />
          <div className="relative z-10 flex flex-col justify-center items-start p-20" style={{ maxWidth: '50%' }}>
            <h1 className="text-white text-8xl font-bold mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
              Javascript Resource Development
            </h1>
            <h2 className="text-white text-2xl font-regular mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
              Library of codes for Storyline 360
            </h2>
          </div>
          <div className="relative z-10 flex flex-col justify-center items-start p-20" style={{ maxWidth: '50%' }}>
            <h3 className="text-white text-1xl font-regular p-9 bg-white bg-opacity-5 rounded-lg backdrop-blur-lg border-opacity-100 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ fontFamily: 'Lato, sans-serif' }}>
            Welcome to Capytech's JRD Library, thoughtfully crafted by Team Ba. We're excited to introduce you to the power of JRD, which can elevate your e-learning courses with captivating animations and interactive features. Our goal is to enhance your educational experience through innovative solutions. Stay tuned for regular updates and improvements as we continue to refine and expand our offerings.
            </h3>
          </div>
        </header>

        <div className="fixed top-4 left-4 flex gap-4 z-50">
          <Button
            onClick={() => window.location.href = 'https://dam.capytech.com'}
            className="bg-[#4682B4] text-white px-6 py-4 text-base hover:bg-blue-900"
          >
            <Link className="mr-2 h-6 w-6" />
            CapyDAM
          </Button>
        </div>

        <div className="fixed top-4 right-4 flex gap-4 z-50">
           
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
          <Button onClick={() => toggleSort('dateAdded')} variant="outline">
            Sort by Date {sortBy === 'dateAdded' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button onClick={() => toggleSort('likes')} variant="outline">
            Sort by Likes {sortBy === 'likes' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button onClick={() => setGridView(!gridView)} variant="outline">
            {gridView ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
        </div>

        <div ref={searchBarRef} className="mb-4">
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black bg-opacity-95"
          />
        </div>

        {showStickySearch && (
          <div className="fixed rounded-lg max-w-screen-lg mx-auto top-0 left-0 right-0 bg-black bg-opacity-95 p-4 z-40 transition-all duration-300 ease-in-out">
            <Input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black bg-opacity-95"
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-black text-3xl font-bold">Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center text-black text-3xl font-bold">No entries found. Add a new entry to get started!</div>
        ) : (
          <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Entry</DialogTitle>
              <DialogDescription>Fill in the details for your new library entry. Please take note that only those with the correct password can submit this form.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
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
                    <Tiptap
                      content={newEntry.description}
                      onChange={handleDescriptionChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="documentationUrl">Documentation URL</Label>
                    <Input
                      id="documentationUrl"
                      name="documentationUrl"
                      value={newEntry.documentationUrl}
                      onChange={handleInputChange}
                      placeholder="https://docs.example.com/guide"
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
                </div>
                <div className="space-y-4">
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
                {selectedEntry.image && (
                  <div className="w-full flex justify-center mb-4">
                    <img 
                      src={selectedEntry.image.trim() || "/placeholder.svg"}
                      alt={selectedEntry.title || 'Entry image'} 
                      className="max-w-full h-auto rounded-lg" 
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: selectedEntry.description }} />
                </div>
                
                {/* ==================== CLICKABLE DOCUMENTATION SECTION IN DIALOG ==================== */}
                {selectedEntry.documentationUrl && selectedEntry.documentationUrl.trim() !== '' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                          Documentation
                        </h3>
                      </div>
                      <a 
                        href={selectedEntry.documentationUrl.trim()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Documentation
                      </a>
                    </div>
                  </div>
                )}
                {/* ==================== END CLICKABLE DOCUMENTATION SECTION ==================== */}
                
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
      <LiveChat />
    </div>
  )
}

function getYouTubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}