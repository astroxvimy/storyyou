"use client"

import { useEffect, useState } from "react";
import Image from "next/image";

import { StoryWithPages } from "@/features/story/controllers/get-story";
import { storyService } from "@/libs/api_service";
import { Database } from "@/libs/supabase/types";

const GALEERY_SLIDER_LENGTH = 10;

type StoryPage = Database ['public']['Tables']['story_pages']['Row'];

export function StorySlider({storyWithPage}: {storyWithPage: StoryWithPages | null}) {
    const [pages, setPages] = useState<StoryPage[]>();

    useEffect(() => {
       setPages(storyWithPage?.story_pages)
    }, [pages])
    // const pages = storyWithPage?.story_pages;
    let displayedPages: typeof pages;

    if ( pages && pages.length >= GALEERY_SLIDER_LENGTH) {
        displayedPages = pages.slice(0, GALEERY_SLIDER_LENGTH);
    } else {
        const times = pages && Math.ceil(GALEERY_SLIDER_LENGTH / pages.length);
        displayedPages = Array(times).fill(pages).flat().slice(0, GALEERY_SLIDER_LENGTH);
    }
    return (
        <div className="gallery">
            {displayedPages?.map((page, index) => page && page.page_image && <img key={storyWithPage?.id + page.id + index} src={page.page_image ?? ''} alt={page.id} />)}
        </div>
    )
}