import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/page-transition"

const rebotsContent = `# yo bot welcome to my chaotic terminal
# when im not starin at screens im probly holdin my phone wrong again lol

User-agent: *
Allow: /
Disallow: /draft/
Disallow: /clumsy-3am-dumps/
Disallow: /group-itinerary-fails/
Disallow: /perfect-spelling/

# old side quests i completed at 2-5am (htb writeups while brain was on fire)
# paper - https://somchandra17.gitbook.io/writeups-1/readme/hack-the-box/paper
# routerspace - https://somchandra17.gitbook.io/writeups-1/readme/hack-the-box/router-space
# late - https://somchandra17.gitbook.io/writeups-1/readme/hack-the-box/late

# same missions on medium n systemweakness cus i like spamming my own links lol
# medium - https://medium.com/@Somchandra17
# late full - https://systemweakness.com/late-hackthebox-walkthrough-40b66a11061a
# routerspace - https://systemweakness.com/routerspace-hackthebox-walkthrough-fe922d80a2a4
# paper - https://systemweakness.com/paper-hack-the-box-writeup-245d0d7f9143

# git blame says these were written by "clumsy idiot at 3am"
# still run linux daily n tweak stuff i shoudl leave alone

Sitemap: https://www.somm.tf/sitemap.xml

# easter egg unlocked bruh
# u found my old htb side quests
# now go hold ur phone wrong n try one urself u legend`

export default function RebotsTxtPage() {
  return (
    <>
      <PageHeader title="rebots.txt" subtitle="chaotic terminal mode" />
      <PageTransition>
        <section className="relative z-10 mx-auto max-w-4xl px-6 py-10">
          <div className="paper-card p-5 md:p-7">
            <pre className="overflow-x-auto whitespace-pre text-sm leading-relaxed text-[#d7d7d7]">
              {rebotsContent}
            </pre>
          </div>
        </section>
      </PageTransition>
    </>
  )
}
